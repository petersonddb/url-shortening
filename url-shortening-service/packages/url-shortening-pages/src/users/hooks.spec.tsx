import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook} from "@testing-library/react";
import type {ReactNode} from "react";
import {UserServiceContext} from "./contexts.ts";
import {useUserService} from "./hooks.ts";
import {type UserService} from "./users.ts";
import type { JSX } from "react/jsx-runtime";

describe("user service hook", () => {
    it("should THROW because there is no user service in the context", () => {
        expect(() => renderHook(() => useUserService()))
            .toThrowError(/no user service/i)
    });

    describe("when there is a user service in the context", () => {
        let userService: UserService;
        let withUserServiceProvided: ({ children }: { children: ReactNode; }) => JSX.Element;

        beforeEach(() => {
            userService = { create: vi.fn() };

            withUserServiceProvided = ({children}: { children: ReactNode }) => {
                return (
                    <UserServiceContext value={userService}>
                        {children}
                    </UserServiceContext>
                );
            };
        });

        it("should return the user service from the context", () => {
            const {result} = renderHook(() => useUserService(), {wrapper: withUserServiceProvided});

            expect(result.current).toEqual(userService);
        });
    });
});
