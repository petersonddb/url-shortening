import {afterAll, afterEach, beforeAll, describe, expect, it} from "vitest";
import {setupServer} from "msw/node";
import {ApiUserService} from "./users.ts";
import {http, HttpResponse} from "msw";
import {ValidationErrors} from "../errors/errors.ts";

describe("api user service", () => {
    const baseUrl: string = "http://localhost:3000";
    const service = new ApiUserService(baseUrl);
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

    it("should return created user when user is created", async () => {
        const user = {id: "user-id", name: "user-name", email: "user@email.com"};

        server.use(http.post(`${baseUrl}/api/users`, () => {
            return HttpResponse.json({data: user}, {status: 201});
        }));

        const gotUser =
            await service.create({email: user.email, password: "my-pass"});

        expect(gotUser).toEqual(user);
    });

    it("should throw an error when user is created but not returned", async () => {
        const user = {id: "user-id", name: "user-name", email: "user@email.com"};

        server.use(http.post(`${baseUrl}/api/users`, () => {
            return HttpResponse.json({format: "unknown"}, {status: 201});
        }));

        const promise =
            service.create({email: user.email, password: "my-pass"});

        await expect(promise).rejects.toThrow(/invalid server response/);
    });

    it("should throw validation errors when user validation fails", async () => {
        server.use(http.post(`${baseUrl}/api/users`, () => {
            return HttpResponse.json({errors: [{field: "email", messages: ["invalid email"]}]}, {status: 422});
        }));

        const promise =
            service.create({email: "anything", password: "anything"});

        await expect(promise).rejects.toThrow(ValidationErrors);
        await expect(promise).rejects.toThrow(/Validation failed/);
    });

    it("should throw an error when server response is NOT ok, with NO errors details", async () => {
        server.use(http.post(`${baseUrl}/api/users`, () => {
            return HttpResponse.json({format: "unknown"}, {status: 500});
        }));

        const promise =
            service.create({email: "anything", password: "anything"});

        await expect(promise).rejects.toThrow(/failed/);
    });

    it("should throw an error when server response is NOT ok, with errors details", async () => {
        server.use(http.post(`${baseUrl}/api/users`, () => {
            return HttpResponse.json(
                {
                    errors: [
                        {field: "user", messages: ["some failure", "some failure 2"]},
                        {field: "other", messages: ["other failure"]}
                    ]
                }, {status: 500}
            );
        }));

        const promise =
            service.create({email: "anything", password: "anything"});

        await expect(promise).rejects.toThrow(/user: some failure, some failure 2\nother: other failure/);
    });

    it("should throw an error when request fails", async () => {
        server.use(http.post(`${baseUrl}/api/users`, () => {
            return HttpResponse.error();
        }));

        const promise = service.create({email: "anything", password: "anything"});

        await expect(promise).rejects.toThrow(/server request failed/);
    });
});
