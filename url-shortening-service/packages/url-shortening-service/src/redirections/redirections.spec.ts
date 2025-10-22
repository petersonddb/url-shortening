import {beforeEach, describe, expect, it, vi} from "vitest";
import {getRedirectionUrl} from "./redirections.js";
import type {Short, ShortService} from "../shorts/shorts.js";

describe("get redirection link use case", () => {
    const mockFindByHash = vi.fn();
    const mockShortService: Partial<ShortService> = {findByHash: mockFindByHash};

    const run = () =>
        getRedirectionUrl("some-hash", mockShortService as ShortService);

    describe("when the service returns a still valid short link", () => {
        const originalUrl = new URL("https://test.com/long-1");

        beforeEach(() => {
            const validDate = new Date();
            validDate.setFullYear(validDate.getFullYear() + 1);

            mockFindByHash.mockResolvedValue({
                hash: "some-hash",
                originalUrl: originalUrl,
                expire: validDate,
            } as Short);
        });

        it("should return the original url for redirection", async () => {
            const url = await run();

            expect(url).toEqual(originalUrl);
        });
    });

    describe("when the service returns a expired short link", () => {
        beforeEach(() => {
            const expiredDate = new Date();
            expiredDate.setFullYear(expiredDate.getFullYear() - 1);

            mockFindByHash.mockResolvedValue({
                hash: "some-hash",
                originalUrl: new URL("https://test.com/long-expired"),
                expire: expiredDate,
            } as Short);
        });

        it("should not return a url for redirection", async () => {
            const url = await run();

            expect(url).toBeNull();
        });
    });

    describe("when the service fails", () => {
        beforeEach(() => {
            mockFindByHash.mockRejectedValue(Error("mocked find by hash"));
        });

        it("should throw an error", async () => {
            await expect(run()).rejects.toThrow(/failed to find.* mocked find by hash/i);
        });
    });
});
