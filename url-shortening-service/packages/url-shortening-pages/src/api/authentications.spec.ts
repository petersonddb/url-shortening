import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {ApiAuthService} from "./authentications.ts";
import {setupServer} from "msw/node";
import {http, HttpResponse} from "msw";

describe("api auth service", () => {
    const baseUrl = "http://localhost:3000";
    const service = new ApiAuthService(baseUrl);
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

    describe("authenticate", () => {
        const authenticate = () =>
            service.authenticate({email: "any", password: "any"});

        describe("when authentication succeeds", () => {
            const authToken = "secret-token";

            beforeEach(() => {
                server.use(http.post(`${baseUrl}/api/authentications`, ({request}) => {
                    if (!request.headers.has("Authorization")) {
                        return HttpResponse.json({}, {status: 400});
                    }

                    return HttpResponse.json({data: authToken}, {status: 202})
                }));
            });

            it("should return an authentication token", async () => {
                const gotAuthToken = await authenticate();

                expect(gotAuthToken).toEqual(authToken);
            });

            it("should store authentication token and data", async () => {
                await authenticate();

                expect(service.authorization).toEqual(`Bearer ${authToken}`);
            });
        });

        describe("when authentication succeeds with inconsistent response", () => {
            beforeEach(() => {
                server.use(http.post(`${baseUrl}/api/authentications`, ({request}) => {
                    if (!request.headers.has("Authorization")) {
                        return HttpResponse.json({}, {status: 400});
                    }

                    return HttpResponse.json({format: "unknown"}, {status: 202});
                }));
            });

            it("should throw an error about it", async () => {
                await expect(authenticate()).rejects.toThrow(/invalid server response/);
            })

            it("should not store authentication token and data", async () => {
                await expect(authenticate()).rejects.toThrow();

                expect(service.authorization).toBeNull();
            });
        });

        describe("when request fails", () => {
            beforeEach(() => {
                server.use(http.post(`${baseUrl}/api/authentications`, () => {
                    return HttpResponse.error();
                }))
            });

            it("should throw an error about it", async () => {
                await expect(authenticate()).rejects.toThrow(/server request failed/);
            })

            it("should not store authentication token and data", async () => {
                await expect(authenticate()).rejects.toThrow();

                expect(service.authorization).toBeNull();
            });
        });

        describe("when authentication fails", () => {
            beforeEach(() => {
                server.use(http.post(`${baseUrl}/api/authentications`, () => {
                    return HttpResponse.json(
                        {
                            errors: [
                                {field: "authentication", messages: ["some failure", "some failure 2"]},
                                {field: "other", messages: ["other failure"]},
                            ]
                        },
                        {status: 500}
                    );
                }));
            });

            it("should throw an error with server response", async () => {
                await expect(authenticate()).rejects.toThrow(/authentication: some failure, some failure 2\nother: other failure/);
            });

            it("should not store authentication token and data", async () => {
                await expect(authenticate()).rejects.toThrow();

                expect(service.authorization).toBeNull();
            });
        });
    });
});
