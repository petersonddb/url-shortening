import {beforeEach, describe, expect, it, vi} from "vitest";
import {type AuthenticableService, authenticate} from "./authentications.js";
import jwt from "jsonwebtoken";
import {fail} from "node:assert";

describe("authenticate use case", () => {
    const findByEmailMock = vi.fn();
    const authenticableService: AuthenticableService = {findByEmail: findByEmailMock};

    describe("given a authenticable is found", () => {
        beforeEach(() => {
            findByEmailMock.mockResolvedValue({
                id: "test-id",
                name: "test",
                email: "test@email.com",
                password: "$2b$10$XFwlhTEIecWzekRWGuwkBualeCYU7mvjNxWM2BL505MlHao8g1gn2"
            });
        });

        describe("given valid credentials", () => {
            const run = () =>
                authenticate({email: "test@email.com", password: "Pass123!"}, authenticableService);

            it("should return a auth token", async () => {
                const authToken = await run();
                const payload = jwt.decode(authToken);

                if (payload == null || typeof payload === "string" || !payload.iat || !payload.exp) {
                    fail("unexpected auth token payload type, should be a JwtPayload");
                } else {
                    // expiration
                    const expYear =
                        new Date(payload.exp * 1000).getFullYear() - new Date(payload.iat * 1000).getFullYear();

                    expect(expYear).toEqual(1);

                    // claims
                    expect(payload.sub).toEqual("test-id");
                    expect(payload.aud).toEqual("url-shortening");

                    // customs
                    expect(payload.name).toEqual("test");

                    // make sure there is no password added in the payload
                    expect(payload.pas ?? payload.password).toBeUndefined();
                }
            });
        });

        describe("given invalid credentials", () => {
            const run = () =>
                authenticate({email: "test@email.com", password: "Invalid123!"}, authenticableService);

            it("should throw an error for invalid credentials", async () => {
                await expect(run()).rejects.toThrow(/invalid credentials/i);
            });
        });
    });

    describe("given the authenticable is NOT found", () => {
        beforeEach(() => {
            findByEmailMock.mockResolvedValue(null);
        });

        const run = () =>
            authenticate({email: "test@email.com", password: "Invalid123!"}, authenticableService);

        it("should throw an error for invalid credentials", async () => {
            await expect(run()).rejects.toThrow(/invalid credentials/i);
        })
    });

    describe("when the authenticable fails", () => {
        beforeEach(() => {
            findByEmailMock
                .mockRejectedValue(Error("failed to authenticate: mocked failure"));
        });

        const run = () =>
            authenticate({email: "anything@email.com", password: "Anything123!"}, authenticableService);

        it("should throw an error for authenticable failure", async () => {
            await expect(run()).rejects.toThrow(/mocked failure/i);
        });
    });
});
