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

    describe("create short", () => {
        const originalUrl = "https://test.com/long-url?title=long";

        const create = () =>
            service.create({originalUrl: new URL(originalUrl)})

        describe("when the server respond successfully", () => {
            const createdShort = {
                hash: "abc123",
                originalUrl: new URL(originalUrl),
                expire: new Date()
            } as Short;

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
                const gotShort = await create();

                expect(gotShort).toEqual(createdShort);
            });
        });

        describe("when the server respond successfully with incorrect response body", () => {
            beforeEach(() => {
                server.use(http.post(`${baseUrl}/api/shorts`, () => {
                    return HttpResponse.json({format: "invalid"}, {status: 201});
                }));
            });

            it("should throw an error", async () => {
                await expect(create).rejects.toThrow(/invalid server response/);
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
                await expect(create).rejects.toThrow(/server request failed/i);
            });
        });
    });

    describe("list shorts", () => {
        const list = () => service.list();

        describe("when the server respond with NO shorts", () => {
            beforeEach(() => {
                server.use(http.get(`${baseUrl}/api/shorts`, () => {
                    return HttpResponse.json({data: []}, {status: 200});
                }));
            });

            it("should return an empty list", async () => {
                const shorts = await list();

                expect(shorts).toHaveLength(0);
            })
        });

        describe("when the server respond with the shorts", () => {
            beforeEach(() => {
                server.use(http.get(`${baseUrl}/api/shorts`, () => {
                    return HttpResponse.json({
                        data: [
                            {
                                hash: "111111",
                                originalUrl: (new URL("http://test.com/long-1")).toString(),
                                expire: (new Date()).toISOString()
                            }, {
                                hash: "222222",
                                originalUrl: (new URL("http://test.com/long-2")).toString(),
                                expire: (new Date()).toISOString()
                            }, {
                                hash: "333333",
                                originalUrl: (new URL("http://test.com/long-3")).toString(),
                                expire: (new Date()).toISOString()
                            },
                        ]
                    }, {status: 200});
                }));
            });

            it("should return the list of shorts", async () => {
                const shorts = await list();

                expect(shorts).toHaveLength(3);
                expect(shorts).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({hash: "111111"}),
                        expect.objectContaining({hash: "222222"}),
                        expect.objectContaining({hash: "333333"}),
                    ])
                );
            });
        });

        describe("when the server respond successfully with an invalid response", () => {
            beforeEach(() => {
                server.use(http.get(`${baseUrl}/api/shorts`, () => {
                    return HttpResponse.json({format: "invalid"}, {status: 200});
                }));
            });

            it("should throw an error", async () => {
                await expect(list).rejects.toThrow(/invalid server response/i);
            });
        });

        describe("when the server respond with an error", () => {
            beforeEach(() => {
                server.use(http.get(`${baseUrl}/api/shorts`, () => {
                    return HttpResponse.json({errors: [{field: "short", messages: ["mocked error"]}]}, {status: 500});
                }));
            });

            it("should throw an error", async () => {
                await expect(list).rejects.toThrow(/failed to list shorts.*500.*short.*mocked error/i);
            });
        });

        describe("when the request fails", () => {
            beforeEach(() => {
                server.use(http.get(`${baseUrl}/api/shorts`, () => {
                    return HttpResponse.error();
                }));
            });

            it("should throw an error", async () => {
                await expect(list).rejects.toThrow(/server request failed/i);
            });
        });
    });
});
