import {beforeEach, describe, expect, it} from "vitest";
import request from "supertest";
import {app} from "../../index.js";
import {faker} from "@faker-js/faker/locale/en";

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
});
