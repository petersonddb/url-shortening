import {beforeAll, beforeEach, describe, expect, it} from "vitest";
import request from "supertest";
import {app} from "../../index.js";
import {faker} from "@faker-js/faker/locale/en";
import {createShort} from "../shorts/shorts.js";
import {fail} from "node:assert";
import {MongoClient} from "mongodb";
import {MongoDbShortService} from "../mongodb/shorts.js";
import {KeygenKeyService} from "../keygen-service/keys.js";
import {KeysClient} from "../keygen-service/keys-contract_grpc_pb.js";
import grpc from "@grpc/grpc-js";

describe("shorts API", () => {
    const api = request(app);

    describe("POST /api/shorts", () => {
        let data: object | null = null;

        const post = async () => {
            return await api.post('/api/shorts').send({data});
        };

        describe("given valid data", () => {
            beforeEach(() => {
                data = {originalUrl: faker.internet.url()};
            });

            it("should respond with created short", async () => {
                const res = await post();

                const body = res.body as { data: { hash: string, originalUrl: string, expire: string } };

                expect(res.statusCode).toEqual(201);
                expect(res.headers["content-type"]).toMatch(/json/i);
                expect(body).toHaveProperty("data");
                expect(Object.keys(body.data)).toEqual(["hash", "originalUrl", "expire"]);
                expect(body.data.hash).toBeTruthy();
            });
        });

        describe("given wrongly formatted data", () => {
            beforeEach(() => {
                data = null;
            });

            it("should respond with bad format error", async () => {
                const res = await post();

                const body = res.body as Partial<{ errors: { field: string, messages: string[] }[] }>;

                expect(res.statusCode).toEqual(400);
                expect(res.headers["content-type"]).toMatch(/json/);
                expect(body).toHaveProperty("errors");
                expect(body.errors).toEqual(
                    expect.arrayContaining([{
                        field: "short",
                        messages: [expect.stringMatching(/invalid request/)]
                    }])
                );
            });
        });

        describe("given invalid data", () => {
            beforeEach(() => {
                data = {originalUrl: "invalid"};
            });

            it("should respond with validation errors", async () => {
                const res = await post();

                const body = res.body as Partial<{ errors: { field: string, messages: string[] }[] }>;

                expect(res.status).toEqual(422);
                expect(res.headers["content-type"]).toMatch(/json/);
                expect(body).toHaveProperty("errors");
                expect(body.errors).toEqual(
                    expect.arrayContaining([
                        {
                            field: "originalUrl",
                            messages: [expect.stringMatching(/should be a valid URL/)]
                        }
                    ])
                );
            })
        });
    });

    describe("given some existent shorts", () => {
        beforeAll(async () => {
            if (!process.env.MONGODB_SERVER) {
                fail("could not configure mongodb: connection string is missing");
            }

            if (!process.env.KEYGEN_SERVICE_URL) {
                fail("could not configure keygen service: connection string is missing");
            }

            // prepare services
            const mongoDbClient = new MongoClient(process.env.MONGODB_SERVER);
            const shortService = new MongoDbShortService(mongoDbClient);

            const keyClient = new KeysClient(process.env.KEYGEN_SERVICE_URL, grpc.credentials.createInsecure());
            const keyService = new KeygenKeyService(keyClient);

            // create some shorts
            for (let i = 0; i < 5; i++) {
                await createShort({originalUrl: new URL(faker.internet.url())}, keyService, shortService);
            }

            // close services client
            await mongoDbClient.close();
        });

        describe("GET /api/shorts", () => {
            const get = async () => {
                return await api.get('/api/shorts');
            };

            it("should respond with all existent shorts", async () => {
                const res = await get();

                const body = res.body as { data: { hash: string, originalUrl: string, expire: string }[] };

                expect(res.status).toEqual(200);
                expect(res.headers["content-type"]).toMatch(/json/i);
                expect(body.data).toBeTruthy();
                expect(body.data.length).toBeGreaterThanOrEqual(5);
                expect(Object.keys(body.data[0] ?? {})).toEqual(["hash", "originalUrl", "expire"]);
            });
        });
    });
});
