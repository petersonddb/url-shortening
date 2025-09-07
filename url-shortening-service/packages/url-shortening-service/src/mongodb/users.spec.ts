import {beforeEach, describe, expect, it, vi} from "vitest";
import {Collection, Db, type MongoClient} from "mongodb";
import {MongoDbUserService} from "./users.js";

describe("mongodb user service", () => {
    const mockInsertOne = vi.fn();
    const mockFindOne = vi.fn();

    const mockCollection: Partial<Collection> = {insertOne: mockInsertOne, findOne: mockFindOne};
    const mockDb: Partial<Db> = {collection: vi.fn().mockReturnValue(mockCollection)};
    const mockClient: Partial<MongoClient> = {db: vi.fn().mockReturnValue(mockDb)};

    const service = new MongoDbUserService(mockClient as MongoClient);

    describe("create user", () => {
        it("should create the user at the mongodb and return it", async () => {
            mockInsertOne.mockResolvedValue({insertedId: "some-id"});

            const user = {name: "user"};
            const createdUser = await service.create(user);

            expect(createdUser.id).toBeTruthy();
            expect(mockDb.collection).toHaveBeenCalledWith("users");
            expect(mockCollection.insertOne).toHaveBeenCalledWith(user);
        });

        it("should throw on mongodb client error", async () => {
            mockInsertOne.mockRejectedValue(new Error("mocked client"));

            const user = {name: "user"};
            const createUser = () => service.create(user);

            await expect(createUser).rejects.toThrow(/failed to store.*mocked client/);
            expect(mockDb.collection).toHaveBeenCalledWith("users");
            expect(mockCollection.insertOne).toHaveBeenCalled();
        });
    });

    describe("find user by email as authenticable", () => {
        describe("given the user is found", () => {
            beforeEach(() => {
                mockFindOne.mockResolvedValue({
                    name: "peter",
                    email: "peter@email.com",
                    password: "<encrypted>",
                });
            });

            it("should return the user as authenticable", async () => {
                const authenticable =
                    await service.findByEmail("peter@email.com");

                expect(authenticable).toBeTruthy();
                expect(authenticable?.email).toEqual("peter@email.com");
                expect(mockDb.collection).toHaveBeenCalledWith("users");
                expect(mockFindOne).toHaveBeenCalledWith({email: "peter@email.com"});
            });
        });

        describe("given the user is NOT found", () => {
            beforeEach(() => {
                mockFindOne.mockResolvedValue(null);
            });

            it("should return no user", async () => {
                const authenticable =
                    await service.findByEmail("peter@email.com");

                expect(authenticable).toBeNull();
                expect(mockDb.collection).toHaveBeenCalledWith("users");
                expect(mockFindOne).toHaveBeenCalledWith({email: "peter@email.com"});
            });
        });

        describe("given the service fails", () => {
            beforeEach(() => {
                mockFindOne.mockRejectedValue(Error("mocked error"));
            });

            it("should throw", async () => {
                const find =
                    service.findByEmail("peter@email.com");

                await expect(find).rejects.toThrow(/mocked error/);
            });
        });
    });
});
