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
                name: "peter",
                email: "peter@email.com",
                password: "$2b$10$XFwlhTEIecWzekRWGuwkBualeCYU7mvjNxWM2BL505MlHao8g1gn2"
            });
        });

        describe("given valid credentials", () => {
            const email = "peter@email.com";
            const password = "Pass123!";

            it("should return a auth token", async () => {
                const authToken =
                    await authenticate({email, password}, authenticableService);

                const payload = jwt.decode(authToken);

                if (payload != null && typeof payload != "string" && payload.iat && payload.exp) {
                    const expYear =
                        new Date(payload.exp * 1000).getFullYear() - new Date(payload.iat * 1000).getFullYear();

                    expect(expYear).toEqual(1);

                    expect(payload.sub).toEqual("peter");
                    expect(payload.aud).toEqual("url-shortening");

                    // customs
                    expect(payload.ema).toEqual("peter@email.com");

                    // make sure there is no password added in the payload
                    expect(payload.pas ?? payload.password).toBeUndefined();
                } else {
                    fail("unexpected auth token payload type, should be a JwtPayload");
                }
            });
        });

        describe("given invalid credentials", () => {
            const email = "peter@email.com";
            const password = "Invalid123!";

            it("should throw an error for invalid credentials", async () => {
                const auth =
                    authenticate({email, password}, authenticableService);

                await expect(auth).rejects.toThrow(/invalid credentials/i);
            });
        });
    });

    describe("given the authenticable is NOT found", () => {
        beforeEach(() => {
            findByEmailMock.mockResolvedValue(null);
        });

        it("should throw an error for invalid credentials", async () => {
            const email = "peter@email.com";
            const password = "Pass123!";

            const auth =
                authenticate({email, password}, authenticableService);

            await expect(auth).rejects.toThrow(/invalid credentials/i);
        })
    });

    describe("when the authenticable fails", () => {
        beforeEach(() => {
            findByEmailMock
                .mockRejectedValue(Error("failed to authenticate: mocked failure"));
        });

        it("should throw an error for authenticable failure", async () => {
            const auth =
                authenticate({email: "anything@email.com", password: "Anything123!"}, authenticableService);

            await expect(auth).rejects.toThrow(/mocked failure/i);
        });
    });
});
