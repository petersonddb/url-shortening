import {it, expect, describe, vi, beforeEach} from "vitest";
import {createUser, type User, type UserService, validateUserAll} from "./users.js";
import {ValidationError} from "../errors/validations.js";

describe("create user use case", () => {
    it("should create a valid user", async () => {
        const userService: UserService = {
            create: vi.fn((user: User) => {
                user.id = "some-id";

                return Promise.resolve(user)
            })
        };

        const user = await createUser({email: "user.test@email.com", password: "Pass123!"}, userService);

        expect(user.id).not.toBeUndefined();
        expect(user.name).toEqual("user.test");
        expect(user.password).not.toEqual("Pass123!");
        expect(user.password?.length ?? 0).toBeGreaterThanOrEqual(50);
    });

    it("should throw with validation errors given invalid params", async () => {
        const userService: UserService = {create: vi.fn()};

        const create = () =>
            createUser({email: "invalid", password: "invalid"}, userService);

        await expect(create).rejects.toThrow(ValidationError);
        await expect(create).rejects.toThrow(/validation failed/);

        // TODO: test which validations are being applied
    });

    it("should throw when user service fails", async () => {
        const userService: UserService = {create: vi.fn(() => Promise.reject(Error("mocked service")))};

        const create = () =>
            createUser({email: "user.test@email.com", password: "Pass123!"}, userService);

        await expect(create).rejects.toThrow(Error);
        await expect(create).rejects.toThrow(/service failed.*mocked service/);
    })
});

describe("user validations", () => {
    let user: User;

    describe("given empty properties", () => {
        beforeEach(() => {
            user = {email: "", password: ""};
        });

        it("should fail all validations with empty properties messages", () => {
            const result = validateUserAll(user);

            expect(result.valid).toBeFalsy();
            expect(result.failures).toHaveLength(2);
            expect(result.failures).toEqual(expect.arrayContaining([
                {field: "email", messages: [expect.stringMatching(/email.*not be empty/)]},
                {field: "password", messages: [expect.stringMatching(/password.*at least 8/)]}
            ]));
        });
    });

    describe("given filled properties", () => {
        beforeEach(() => {
            user = {email: "user.test@email.com", password: "Pass123!"};
        });

        it("should pass all validations for correct properties", () => {
            const result = validateUserAll(user);

            expect(result.valid).toBeTruthy();
            expect(result.failures).toHaveLength(0);
        });

        it("should fail email validations given invalid address", () => {
            user.email = "invalid";

            const result = validateUserAll(user);

            expect(result.valid).toBeFalsy();
            expect(result.failures).toHaveLength(1);
            expect(result.failures).toEqual(expect.arrayContaining([
                {field: "email", messages: [expect.stringMatching(/should be a valid email/)]}
            ]));
        })

        it("should fail password validations given unsecure password", () => {
            user.password = "invalid";

            const result = validateUserAll(user);

            expect(result.valid).toBeFalsy();
            expect(result.failures).toHaveLength(1);
            expect(result.failures).toEqual(expect.arrayContaining([
                {field: "password", messages: [expect.stringMatching(/password should have/)]}
            ]));
        })
    });
});
