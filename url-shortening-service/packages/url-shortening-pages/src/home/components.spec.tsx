import '@testing-library/jest-dom';
import {beforeEach, describe, expect, it, vi} from "vitest";
import {Home} from "./components.tsx";
import {render, screen, within} from "@testing-library/react";
import type {Short, ShortService} from "../shorts/shorts.ts";
import {ShortServiceContext} from "../shorts/contexts.tsx";
import {MemoryRouter, Route, Routes} from "react-router";
import {userEvent, type UserEvent} from "@testing-library/user-event";
import {AuthError, ValidationErrors} from "../errors/errors.ts";
import {type ReactNode} from "react";
import type {AuthService} from "../authentications/authentications.ts";
import {AuthServiceContext} from "../authentications/contexts.ts";

describe("home component", () => {
    const list = vi.fn().mockResolvedValue([]);
    const create = vi.fn();
    const shortService: ShortService = {list, create};
    const authenticated = {id: "test-user-id", name: "test"};
    const authService: AuthService = {authenticate: vi.fn(), authorization: "some-token", authenticated};
    const settingsRequestUrl = "https://support.com/open?title=some-prefilled-text";
    const component = <Home settingsRequestUrl={settingsRequestUrl}/>;

    const withContextsAndRoutes = ({children}: { children: ReactNode }) => {
        return (
            <ShortServiceContext value={shortService}>
                <AuthServiceContext value={authService}>
                    <MemoryRouter initialEntries={["/home"]}>
                        <Routes>
                            <Route path="/home/*" element={children}/>
                            <Route path="/login" element={<h1>Mocked Login</h1>}/>
                        </Routes>
                    </MemoryRouter>
                </AuthServiceContext>
            </ShortServiceContext>
        )
    };

    let user: UserEvent;

    const renderHome = () => {
        render(component, {wrapper: withContextsAndRoutes});

        user = userEvent.setup();
    };

    describe("when on the default view: shorts", () => {
        it("should have a header with user identification", async () => {
            renderHome();

            expect(await screen.findByRole("heading", {name: "test (test-user-id) / home"})).toBeInTheDocument();
        });

        it("should have navigation links for all views", async () => {
            renderHome();

            expect(await screen.findByRole("tab", {name: "Shorts"})).toBeInTheDocument();
            expect(await screen.findByRole("tab", {name: "Settings"})).toBeInTheDocument();
        });

        it("should have forms to add new shorts", async () => {
            renderHome();

            expect(await screen.findByRole("textbox", {name: "Long URL"})).toBeInTheDocument();
            expect(await screen.findByRole("button")).toBeInTheDocument();
        });

        it("should inform there are no shorts to be shown", async () => {
            renderHome();

            expect(await screen.findByText(/no shorts/i)).toBeInTheDocument();
        });

        describe("given some existent shorts", () => {
            const shorts: Short[] = [
                {
                    hash: "abc123",
                    link: new URL("https://short.link/abc123"),
                    originalUrl: new URL("https://test.com/long-path"),
                    expire: new Date()
                },
                {
                    hash: "def456",
                    link: new URL("https://short.link/def456"),
                    originalUrl: new URL("https://example.com/long-path"),
                    expire: new Date()
                },
            ];

            beforeEach(() => {
                list.mockResolvedValue(shorts);
            });

            for (const short of shorts) {
                it(`should list existent shorts including for ${short.originalUrl}`, async () => {
                    renderHome();

                    const table = await screen.findByRole("table");

                    expect(table).toBeInTheDocument();
                    expect(await within(table).findByRole("row", {name: new RegExp(short.link.toString())}))
                        .toBeInTheDocument();
                });
            }

            describe("when creating a new short with success", () => {
                const originalUrl = new URL("http://localhost:3000/long_path?title=long");

                const newShort = {
                    hash: "new123",
                    link: new URL("http://short.ling/new123"),
                    originalUrl,
                    expire: Date()
                };

                const submit = async () => {
                    renderHome();

                    const input = await screen.findByRole("textbox", {name: "Long URL"});

                    list.mockResolvedValue([...shorts, newShort]);
                    await user.type(input, originalUrl.toString());
                    await user.click(await screen.findByRole("button"));
                };

                beforeEach(() => {
                    create.mockResolvedValue(newShort);
                });

                it("should generate a short link", async () => {
                    await submit();

                    expect(create).toHaveBeenCalledWith({originalUrl});
                    expect(await screen.findByText(/short link generated/i)).toBeInTheDocument();
                    expect(list).toHaveBeenCalled();
                    expect(await screen.findByRole("row", {name: new RegExp(newShort.link.toString())}))
                        .toBeInTheDocument();
                });
            });

            describe("when creating a new short with NO success", () => {
                const originalUrl = new URL("http://localhost:3000/long_path?title=long");

                const submit = async () => {
                    renderHome();

                    const input = await screen.findByRole("textbox", {name: "Long URL"});

                    await user.type(input, originalUrl.toString());
                    await user.click(await screen.findByRole("button"));
                };

                describe("when the service return validation errors", () => {
                    const validationError = new ValidationErrors([
                        {field: "originalUrl", messages: ["empty url", "invalid url"]},
                        {field: "other", messages: ["invalid other"]}
                    ]);

                    beforeEach(() => {
                        create.mockRejectedValue(validationError);
                    });

                    it("should report to the user", async () => {
                        await submit();

                        expect(create).toHaveBeenCalled();
                        expect(await screen.findByText(/validation failed/i)).toBeInTheDocument();
                        expect(await screen.findByText(/empty url/i)).toBeInTheDocument();
                        expect(await screen.findByText(/invalid url/i)).toBeInTheDocument();
                        expect(await screen.findByText(/invalid other/i)).toBeInTheDocument();
                    });
                })

                describe("when the service return an authentication error", () => {
                    const error = new AuthError("mocked auth");

                    beforeEach(() => {
                        create.mockRejectedValue(error);
                    });

                    it("should redirect to login page", async () => {
                        await submit();

                        expect(create).toHaveBeenCalled();
                        expect(await screen.findByRole("heading", {name: /mocked login/i}));
                    });
                });

                describe("when the service throw an error", () => {
                    const error = new Error("some error");

                    beforeEach(() => {
                        create.mockRejectedValue(error);
                    });

                    it("should report to the user", async () => {
                        await submit();

                        expect(create).toHaveBeenCalled();
                        expect(await screen.findByText(/some error/i)).toBeInTheDocument();
                    });
                });
            });

            describe("when service fails to load the shorts", () => {
                const error = new Error("some error");

                beforeEach(() => {
                    list.mockRejectedValue(error);
                });

                it("should allow user manual retry", async () => {
                    renderHome();

                    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
                    expect(await screen.findByRole("button", {name: /try again/i})).toBeInTheDocument();
                });

                describe("when user try again", () => {
                    const tryAgain = async () => {
                        renderHome();
                        list.mockResolvedValue(shorts);

                        const button = await screen.findByRole("button", {name: /try again/i});
                        await user.click(button);
                    };

                    it("should try to load the shorts again", async () => {
                        await tryAgain();

                        expect(await screen.findByRole("row", {name: new RegExp(shorts[0].link.toString())}))
                            .toBeInTheDocument();
                    });
                });
            });

            describe("when it fails to load shorts with an authentication error", () => {
                const error = new AuthError();

                beforeEach(() => {
                    list.mockRejectedValue(error);
                });

                it("should redirect to login page", async () => {
                    renderHome();

                    expect(list).toHaveBeenCalled();
                    expect(await screen.findByRole("heading", {name: /mocked login/i}));
                });
            });
        });
    });

    describe("when navigated to settings view", () => {
        const navigate = async () => {
            renderHome();

            await user.click(await screen.findByRole("tab", {name: "Settings"}));
        };

        beforeEach(() => {
            // will render /home with shorts list by default
            list.mockResolvedValue([]);
        });

        it("should have information on how to access support for settings changes", async () => {
            await navigate();

            const content = await screen.findByRole("link", {name: /ticketing system/i});

            expect(content).toBeInTheDocument();
            expect(content).toHaveAttribute("href", settingsRequestUrl);
        });
    });
});
