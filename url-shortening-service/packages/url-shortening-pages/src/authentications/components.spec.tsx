import '@testing-library/jest-dom';
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {ReactNode} from "react";
import {render, screen} from "@testing-library/react";
import type {AuthService} from "./authentications.ts";
import {AuthServiceContext} from "./contexts.ts";
import {NewAuth} from "./components.tsx";
import {userEvent, type UserEvent} from "@testing-library/user-event";
import {MemoryRouter, Route, Routes} from "react-router";

describe("new authentication component", () => {
    const authenticate = vi.fn();
    const authService: AuthService = {authenticate, authorization: null};

    const withContextAndRouter = ({children}: { children: ReactNode }) => {
        return (
            <AuthServiceContext value={authService}>
                <MemoryRouter initialEntries={["/login"]}>{children}</MemoryRouter>
            </AuthServiceContext>
        );
    };

    const renderNewAuthentication = () => {
        render(
            <Routes>
                <Route path="/login" element={<NewAuth/>}/>
                <Route path="/home" element={<h1>Mocked Home</h1>}/>
            </Routes>, {wrapper: withContextAndRouter}
        );
    };

    it("should have a form for credentials", () => {
        renderNewAuthentication();

        expect(screen.getByRole("textbox", {name: "Email"})).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    describe("when submitting the credentials", () => {
        let user: UserEvent;

        const submit = async () => {
            renderNewAuthentication();

            user = userEvent.setup();

            const email = screen.getByRole("textbox", {name: "Email"});
            const password = screen.getByLabelText("Password");

            await user.type(email, "anything@email.com");
            await user.type(password, "anything")

            await user.click(screen.getByRole("button"));
        };

        describe("when the service respond successfully with the secret token", () => {
            beforeEach(() => {
                authenticate.mockResolvedValue("secret-token");
            });

            it("should authenticate the user", async () => {
                await submit();

                expect(authenticate).toHaveBeenCalled();
                expect(await screen.findByRole("heading", {name: /mocked home/i})).toBeInTheDocument();
            });
        });

        describe("when the service fails", () => {
            const errors = new Error("authentication failed: mocked error");

            beforeEach(() => {
                authenticate.mockRejectedValueOnce(errors);
            });

            it("should fail to authenticate the user", async () => {
                await submit();

                expect(authenticate).toHaveBeenCalled();
                expect(screen.getByText(/authentication failed.*mocked error/i)).toBeInTheDocument();
            });
        });
    });
});
