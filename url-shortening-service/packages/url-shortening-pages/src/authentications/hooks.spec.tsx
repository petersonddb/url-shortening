import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook} from "@testing-library/react";
import type {ReactNode} from "react";
import {AuthServiceContext} from "./contexts.ts";
import type {JSX} from "react/jsx-runtime";
import {useAuthService} from "./hooks.tsx";
import type {AuthService} from "./authentications.ts";

describe("auth service hook", () => {
    it("should THROW because there is no auth service in the context", () => {
        expect(() => renderHook(() => useAuthService()))
            .toThrowError(/no auth service/i)
    });

    describe("given an auth service through the context", () => {
        let authService: AuthService;
        let withAuthServiceProvided: ({children}: { children: ReactNode; }) => JSX.Element;

        beforeEach(() => {
            authService = {authenticate: vi.fn()};

            withAuthServiceProvided = ({children}: { children: ReactNode }) => {
                return (
                    <AuthServiceContext value={authService}>
                        {children}
                    </AuthServiceContext>
                );
            };
        });

        it("should return the auth service from the context", () => {
            const {result} = renderHook(() => useAuthService(), {wrapper: withAuthServiceProvided});

            expect(result.current).toEqual(authService);
        });
    });
});
