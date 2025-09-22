import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook} from "@testing-library/react";
import {useService} from "./hooks.tsx";
import {createContext, type ReactNode} from "react";
import type {JSX} from "react/jsx-runtime";

describe("services hook", () => {
    const service = {action: vi.fn()};
    const ServiceContext = createContext<{ action: () => void } | null>(null);

    describe("when there is a service in the context", () => {
        let withServiceProvided: ({children}: { children: ReactNode; }) => JSX.Element;

        beforeEach(() => {
            withServiceProvided = ({children}: { children: ReactNode }) => {
                return (
                    <ServiceContext value={service}>
                        {children}
                    </ServiceContext>
                );
            };
        });

        it("should return the service", () => {
            const {result} = renderHook(() => useService(ServiceContext), {wrapper: withServiceProvided})

            expect(result.current).toEqual(service);
        });
    });

    describe("when there is NO service in the context", () => {
        it("should throw an error", () => {
            const render = () => {
                renderHook(() => useService(ServiceContext))
            };

            expect(render).toThrowError(/service not provided/i);
        });
    });
});
