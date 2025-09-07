import '@testing-library/jest-dom';
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {ReactNode} from "react";
import {render, screen} from "@testing-library/react";
import type {AuthService} from "./authentications.ts";
import {AuthServiceContext} from "./contexts.ts";
import {NewAuth} from "./components.tsx";
import {userEvent, type UserEvent} from "@testing-library/user-event";

describe("new authentication component", () => {
    const authenticate = vi.fn();
    const authService: AuthService = {authenticate};

    beforeEach(() => {
        const withAuthServiceProvided = ({children}: { children: ReactNode }) => {
            return (
                <AuthServiceContext value={authService}>
                    {children}
                </AuthServiceContext>
            );
        };

        render(<NewAuth/>, {wrapper: withAuthServiceProvided});
    });

    it("should have a form for credentials", () => {
        expect(screen.getByRole("textbox", {name: "Email"})).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    describe("given valid user credentials", () => {
        let user: UserEvent;

        beforeEach(async () => {
            user = userEvent.setup();

            const email = screen.getByRole("textbox", {name: "Email"});
            const password = screen.getByLabelText("Password");

            await user.type(email, "name@email.com");
            await user.type(password, "my-pass")
        });

        it("should authenticate the user once submitted", async () => {
            authenticate.mockResolvedValue("secret-token");

            await user.click(screen.getByRole("button"));

            expect(authenticate).toHaveBeenCalled();
            expect(screen.getByText(/user authenticated/i)).toBeInTheDocument();
        });
    });

    describe("given invalid user credentials", () => {
        let user: UserEvent;

        beforeEach(async () => {
            user = userEvent.setup();

            const email = screen.getByRole("textbox", {name: "Email"});
            const password = screen.getByLabelText("Password");

            await user.type(email, "anything@anything.com");
            await user.type(password, "anything");
        });

        it("should fail to authenticate the user once submitted", async () => {
            const errors = new Error("authentication failed: some error");

            authenticate.mockRejectedValueOnce(errors);

            await user.click(screen.getByRole("button"));

            expect(authenticate).toHaveBeenCalled();
            expect(screen.getByText(/authentication failed.*some error/i)).toBeInTheDocument();
        });
    });
});
