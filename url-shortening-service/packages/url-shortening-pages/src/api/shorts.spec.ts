import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {ApiShortService} from "./shorts.ts";
import {setupServer} from "msw/node";
import {http, HttpResponse} from "msw";
import type {Short} from "../shorts/shorts.ts";
import {ValidationErrors} from "../errors/errors.ts";

describe("api short service", () => {
    const baseUrl = "http://localhost:3000";
    const service = new ApiShortService(baseUrl);
    const server = setupServer();

    beforeAll(() => {
        server.listen({onUnhandledRequest: "error"});
    });

    afterAll(() => {
        server.close();
    });

    afterEach(() => {
        server.resetHandlers();
    });

    describe("when the server respond with short created successfully.", () => {
        const originalUrl = "https://test.com/long-url?title=long";

        const createdShort = {
            hash: "abc123",
            originalUrl: new URL(originalUrl),
            expire: new Date()
        } as Short;

        describe("given a correct response body", () => {
            beforeEach(() => {
                server.use(http.post(`${baseUrl}/api/shorts`, () => {
                    return HttpResponse.json({
                        data: {
                            hash: createdShort.hash,
                            originalUrl: createdShort.originalUrl.toString(),
                            expire: createdShort.expire.toISOString()
                        }
                    }, {status: 201});
                }));
            });

            it("should return the created short", async () => {
                const gotShort = await service.create({originalUrl: new URL(originalUrl)});

                expect(gotShort).toEqual(createdShort);
            });
        });

        describe("given an incorrect response body", () => {
            beforeEach(() => {
                server.use(http.post(`${baseUrl}/api/shorts`, () => {
                    return HttpResponse.json({format: "invalid"});
                }));
            });

            it("should throw an error", async () => {
                const create = service.create({originalUrl: new URL(originalUrl)});

                await expect(create).rejects.toThrow(/invalid server response/);
            });
        });
    });

    describe("when the server respond with short validation errors", () => {
        beforeEach(() => {
            server.use(http.post(`${baseUrl}/api/shorts`, () => {
                return HttpResponse.json({
                    errors: [{
                        field: "originalUrl",
                        messages: ["should be long"]
                    }]
                }, {status: 422});
            }));
        });

        it("should throw a validation error", async () => {
            const create = service.create({originalUrl: new URL("any://anything")});

            await expect(create).rejects.toThrow(ValidationErrors);
            await expect(create).rejects.toThrow(/validation failed/i);
        });
    });

    describe("when the server respond with a NOT parseable error", () => {
        beforeEach(() => {
            server.use(http.post(`${baseUrl}/api/shorts`, () => {
                return HttpResponse.json({format: "unknown"}, {status: 500});
            }))
        });

        it("should throw an an error", async () => {
            const create = service.create({originalUrl: new URL("any://anything")});

            await expect(create).rejects.toThrow(/failed/i);
        });
    });

    describe("when the server respond with a parseable error", () => {
        beforeEach(() => {
            server.use(http.post(`${baseUrl}/api/shorts`, () => {
                return HttpResponse.json({
                    errors: [
                        {field: "short", messages: ["some failure", "some failure 2"]},
                        {field: "other", messages: ["other failure"]},
                    ]
                }, {status: 500});
            }));
        });

        it("should throw an error", async () => {
            const create = service.create({originalUrl: new URL("any://anything")});

            await expect(create).rejects.toThrow(/short: some failure, some failure 2\nother: other failure/);
        })
    });

    describe("when the request fails", () => {
        beforeEach(() => {
            server.use(http.post(`${baseUrl}/api/shorts`, () => {
                return HttpResponse.error();
            }))
        });

        it("should throw an error", async () => {
            const create = service.create({originalUrl: new URL("any://anything")});

            await expect(create).rejects.toThrow(/server request failed/i);
        });
    });
});
