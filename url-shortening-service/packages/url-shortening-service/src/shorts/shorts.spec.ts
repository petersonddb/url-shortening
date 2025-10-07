import {beforeEach, describe, expect, it, vi} from "vitest";
import type {KeyService} from "../keys/keys.js";
import {createShort, isShortExpired, type Short, type ShortService} from "./shorts.js";

describe("create short use case", () => {
    const originalUrl = new URL("https://test.com/long-url?title=long");
    const keyService: Partial<KeyService> = {allocate: vi.fn(), deallocate: vi.fn()};
    const shortService: ShortService = {create: vi.fn(), list: vi.fn(), findByHash: vi.fn()};

    const run =
        async () => await createShort({originalUrl}, keyService as KeyService, shortService);

    describe("when services respond with success", () => {
        beforeEach(() => {
            keyService.allocate = vi.fn().mockResolvedValue("valid-hash");
            shortService.create = vi.fn((short: Short) => Promise.resolve(short));
        });

        it("should return the created short", async () => {
            const short = await run();

            const expectedExpire = new Date();
            expectedExpire.setFullYear(expectedExpire.getFullYear() + 1);

            expect(short.hash).toEqual("valid-hash");
            expect(short.originalUrl).toEqual(originalUrl);
            expect(short.expire?.getFullYear()).toEqual(expectedExpire.getFullYear());
        });
    });

    describe("when key allocation for hash fails", () => {
        beforeEach(() => {
            keyService.allocate = vi.fn().mockRejectedValue(new Error("mocked allocate"));
        });

        it("should throw a error", async () => {
            await expect(run).rejects.toThrow(/key service failed.*mocked allocate/i);
        });
    });

    describe("when shorts service fails", () => {
        beforeEach(() => {
            keyService.allocate = vi.fn().mockResolvedValue("valid-hash");
            keyService.deallocate = vi.fn(() => Promise.resolve());
            shortService.create = vi.fn().mockRejectedValue(new Error("mocked create"));
        });

        it("should throw a error", async () => {
            await expect(run).rejects.toThrow(/short service failed.*mocked create/i);
        })

        it("should deallocate the key", async () => {
            await expect(run).rejects.toThrow();

            expect(keyService.deallocate).toHaveBeenCalledWith("valid-hash");
        });

        describe("when keys service fails to deallocate", () => {
            beforeEach(() => {
                keyService.deallocate = vi.fn().mockRejectedValue(new Error("mocked deallocate"));
            });

            it("should do nothing", async () => {
                await expect(run).rejects.toThrow(/mocked create/i); // not mocked deallocate!

                expect(keyService.deallocate).toHaveBeenCalled();
            });
        });
    });
});

describe("determine short link is expired", () => {
    let short: Short = {};

    const check = () => isShortExpired(short);

    describe("given a valid short link", () => {
        beforeEach(() => {
            const validDate = new Date();
            validDate.setHours(validDate.getHours() + 1);

            short = {expire: validDate}
        });

        it("should NOT be expired", () => {
            expect(check()).toBeFalsy();
        });
    });

    describe("given a expired short link", () => {
        beforeEach(() => {
            const expiredDate = new Date();
            expiredDate.setMinutes(expiredDate.getMinutes() - 1);

            short = {expire: expiredDate};
        });

        it("should be expired", () => {
            expect(check()).toBeTruthy();
        });
    });

    describe("given no expire data", () => {
        beforeEach(() => {
            short = {};
        });

        it("should be expired", () => {
            expect(check()).toBeTruthy();
        });
    });
});
