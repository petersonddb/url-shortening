import '@testing-library/jest-dom';
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {NewUser} from "./components.tsx";
import type {UserService} from "./users.ts";
import type {ReactNode} from "react";
import {UserServiceContext} from "./contexts.ts";
import type {JSX} from "react/jsx-runtime";
import {userEvent} from "@testing-library/user-event";
import {ValidationErrors} from "../errors/errors.ts";

describe("new user component", () => {
    let userService: UserService;
    let withUserServiceProvided: ({children}: { children: ReactNode; }) => JSX.Element;

    beforeEach(() => {
        userService = {create: vi.fn()};

        withUserServiceProvided = ({children}: { children: ReactNode }) => {
            return (
                <UserServiceContext value={userService}>
                    {children}
                </UserServiceContext>
            );
        };

        render(<NewUser/>, {wrapper: withUserServiceProvided});
    });

    it("should allow sending a request to create a new user", async () => {
        const user = userEvent.setup();
        const email = screen.getByRole("textbox", {name: "Email"});

        // NOTE: input type password doesn't have a role
        // https://github.com/testing-library/dom-testing-library/issues/567
        const password = screen.getByLabelText("Password");

        const userServiceMock = vi.mocked(userService);
        const userServiceSpy = vi.spyOn(userServiceMock, "create");

        vi.mocked(userService).create.mockResolvedValue({id: "test-id", name: "test-name", email: "test@email.com"});

        await user.type(email, "name@email.com");
        await user.type(password, "my-pass")
        await user.click(screen.getByRole("button"));

        expect(userServiceSpy).toHaveBeenCalled();
        expect(screen.getByText(/user created/i)).toBeInTheDocument();
    });

    it("should notify errors in a request to create a new user", async () => {
        const user = userEvent.setup();
        const email = screen.getByRole("textbox", {name: "Email"});

        // NOTE: input type password doesn't have a role
        // https://github.com/testing-library/dom-testing-library/issues/567
        const password = screen.getByLabelText("Password");

        const userServiceMock = vi.mocked(userService);
        const userServiceSpy = vi.spyOn(userServiceMock, "create");

        const validationErrors = new ValidationErrors();
        validationErrors.append({ field: "email", messages: ["invalid email"] });
        validationErrors.append({ field: "password", messages: ["invalid password"] });

        vi.mocked(userService).create.mockRejectedValue(validationErrors);

        await user.type(email, "name@email.com");
        await user.type(password, "my-pass")
        await user.click(screen.getByRole("button"));

        expect(userServiceSpy).toHaveBeenCalled();
        expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
    });
});
