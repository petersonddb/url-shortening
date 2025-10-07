import {beforeAll, beforeEach, describe, expect, it} from "vitest";
import request from "supertest";
import {app} from "../../index.js";
import {fail} from "node:assert";
import {MongoClient} from "mongodb";
import {MongoDbShortService} from "../mongodb/shorts.js";
import {KeysClient} from "../keygen-service/keys-contract_grpc_pb.js";
import grpc from "@grpc/grpc-js";
import {KeygenKeyService} from "../keygen-service/keys.js";
import {createShort, type Short} from "../shorts/shorts.js";
import {faker} from "@faker-js/faker/locale/en";

describe("redirections pages", () => {
    const page = request(app);

    describe("given some existent shorts", () => {
        const shorts: Short[] = [];

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
                const short = await createShort({originalUrl: new URL(faker.internet.url())}, keyService, shortService);

                shorts.push(short);
            }

            // close services client
            await mongoDbClient.close();
        });

        describe("GET /r/:hash", () => {
            let short: Short = {};

            const get = () => page.get(`/r/${short.hash ?? ""}`);

            describe("with a hash of a valid existent short", () => {
                beforeEach(() => {
                    short = {...shorts[2]};
                });

                it("should redirect to short original url", async () => {
                    const res = await get();

                    expect(res.status).toEqual(302);
                    expect(res.redirect).toBeTruthy();
                    expect(res.headers.location).toEqual(short.originalUrl?.toString());
                });
            });

            describe("with a hash for a NOT existent short", () => {
                beforeEach(() => {
                    short = {hash: "000000"};
                });

                it("should respond as not found", async () => {
                    const res = await get();

                    expect(res.status).toEqual(404);
                    expect(res.redirect).toBeFalsy();
                    expect(res.text).toMatch(/no valid url found/i);
                });
            });
        });
    });
});
