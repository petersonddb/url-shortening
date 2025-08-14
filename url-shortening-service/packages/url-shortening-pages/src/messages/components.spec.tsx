import '@testing-library/jest-dom';
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {Message, type MessageContent} from "./components.tsx";
import {userEvent} from "@testing-library/user-event";

describe("Message component", () => {
    let message: MessageContent | undefined;

    beforeEach(() => {
       message = { kind: "success", node: "my message" };
    });

    it("should show up in the screen", () => {
        render(<Message message={message} onClose={vi.fn()}/>)

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.queryByText(/success/i)).toBeInTheDocument();
        expect(screen.queryByText("my message")).toBeInTheDocument();
    });

    it("should call onClose when clicking close button", async () => {
        const clickHandler = vi.fn();

        render(<Message message={message} onClose={clickHandler} />);
        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(clickHandler).toHaveBeenCalled();
    });

    describe("when there is NO message", () => {
        beforeEach(() => {
            message = undefined;

            render(<Message message={message} onClose={vi.fn()} />)
        });

        it("should NOT show up in the screen", () => {
            expect(screen.queryByRole("alert")).toBeNull();
        });
    });
});
