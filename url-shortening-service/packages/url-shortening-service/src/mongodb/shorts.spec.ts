import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Short, ShortService} from "../shorts/shorts.js";
import {MongoDbShortService} from "./shorts.js";
import {Collection, Db, type MongoClient} from "mongodb";

describe("mongodb shorts service", () => {
    const mockInsertOne = vi.fn();

    const mockCollection: Partial<Collection> = {insertOne: mockInsertOne};
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
});
