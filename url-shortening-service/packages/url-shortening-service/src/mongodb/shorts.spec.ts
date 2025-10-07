import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Short, ShortService} from "../shorts/shorts.js";
import {MongoDbShortService} from "./shorts.js";
import {Collection, Db, type MongoClient} from "mongodb";

describe("mongodb shorts service", () => {
    const mockInsertOne = vi.fn();
    const mockFind = vi.fn();
    const mockFindOne = vi.fn();

    const mockCollection: Partial<Collection> = {insertOne: mockInsertOne, find: mockFind, findOne: mockFindOne};
    const mockDb: Partial<Db> = {collection: vi.fn().mockReturnValue(mockCollection)};
    const mockClient: Partial<MongoClient> = {db: vi.fn().mockReturnValue(mockDb)};

    const service: ShortService = new MongoDbShortService(mockClient as MongoClient);

    describe("create short", () => {
        const short: Short = {};
        const create = async () => service.create(short);

        describe("when mongodb succeeds", () => {
            beforeEach(() => {
                mockInsertOne.mockResolvedValue({insertedId: "some-id"});
            });

            it("should return the created short", async () => {
                const gotShort = await create();

                expect(gotShort).toEqual(short);
                expect(mockDb.collection).toHaveBeenCalledWith("shorts");
                expect(mockInsertOne).toHaveBeenCalledWith(short);
            });
        });

        describe("when mongodb fails", () => {
            beforeEach(() => {
                mockInsertOne.mockRejectedValue(Error("mocked insertOne"));
            });

            it("should throw an error", async () => {
                await expect(create).rejects.toThrow(/failed to store new short.*mocked insertOne/i);
                expect(mockDb.collection).toHaveBeenCalledWith("shorts");
                expect(mockInsertOne).toHaveBeenCalledWith(short);
            });
        });
    });

    describe("list shorts", () => {
        const list = () => service.list();

        describe("when mongodb successfully return all shorts", () => {
            const mockShorts = [
                {hash: "111111", originalUrl: "https://test.com/long-1", expire: new Date()},
                {hash: "222222", originalUrl: "https://test.com/long-2", expire: new Date()},
            ];

            beforeEach(() => {
                mockFind.mockReturnValue({
                    toArray: vi.fn(() => Promise.resolve(mockShorts))
                });
            });

            it("should return the list of shorts", async () => {
                const gotShorts = await list();

                const shorts: Short[] = mockShorts.map((short): Short => (
                    {...short, originalUrl: new URL(short.originalUrl)}));

                expect(gotShorts).toEqual(shorts);
                expect(mockDb.collection).toHaveBeenCalledWith("shorts");
                expect(mockFind).toHaveBeenCalled();
            });
        })

        describe("when mongodb fails to return shorts", () => {
            beforeEach(() => {
                mockFind.mockReturnValue({
                    toArray: vi.fn(() => Promise.reject(new Error("mocked find")))
                });
            });

            it("should throw an error", async () => {
                await expect(list()).rejects.toThrow(/failed to get shorts.*mocked find/i);
                expect(mockDb.collection).toHaveBeenCalledWith("shorts");
                expect(mockFind).toHaveBeenCalled();
            });
        });
    });

    describe("find by hash", () => {
        const findByHash = () => service.findByHash("111111");

        describe("when mongodb successfully return a short", () => {
            const short: Short = {hash: "111111"};

            beforeEach(() => {
                mockFindOne.mockResolvedValue(short);
            });

            it("should return the found short", async () => {
                const gotShort = await findByHash();

                expect(gotShort).toEqual(short);
                expect(mockDb.collection).toHaveBeenCalledWith("shorts");
                expect(mockFindOne).toHaveBeenCalledWith({hash: short.hash});
            });
        });

        describe("when mongodb returns NO short", () => {
            beforeEach(() => {
                mockFindOne.mockResolvedValue(null);
            });

            it("should return nothing", async () => {
                const gotShort = await findByHash();

                expect(gotShort).toBeNull();
                expect(mockDb.collection).toHaveBeenCalledWith("shorts");
                expect(mockFindOne).toHaveBeenCalled();
            });
        });

        describe("when mongodb fails", () => {
            beforeEach(() => {
                mockFindOne.mockRejectedValue(Error("mocked find one"));
            });

            it("should throw an error", async () => {
                await expect(findByHash()).rejects.toThrow(/failed to find.*mocked find one/i);
                expect(mockDb.collection).toHaveBeenCalledWith("shorts");
                expect(mockFindOne).toHaveBeenCalled();
            });
        });
    });
});
