import {beforeAll, beforeEach, describe, expect, it} from "vitest";
import {app} from "../../index.js";
import request, {type Test} from "supertest";
import {MongoClient} from "mongodb";
import {MongoDbUserService} from "../mongodb/users.js";
import {faker} from "@faker-js/faker/locale/en";
import {createUser, type User} from "../users/users.js";
import {fail} from "node:assert";

describe("authentications API", () => {
    const api = request(app);

    describe("given some existent users", () => {
        const users: Required<Omit<User, "id">>[] = [];

        beforeAll(async () => {
            if (!process.env.MONGODB_SERVER) {
                fail("could not configure mongodb: connection string is missing");
            }

            // prepare services
            const mongoDbClient = new MongoClient(process.env.MONGODB_SERVER);
            const userAuthService = new MongoDbUserService(mongoDbClient);

            // create some users
            for (let i = 0; i < 5; i++) {
                const user = {
                    name: faker.internet.displayName(),
                    email: faker.internet.email(),
                    password: faker.internet.password({prefix:"Pass123!"})
                };

                users.push(user);
                await createUser(user, userAuthService);
            }

            // close services client
            await mongoDbClient.close();
        });

        describe("POST /authentications", () => {
            let req: Test

            beforeEach(() => {
                req = api.post("/api/authentications");
            });

            describe("given valid credentials", () => {
                let user: Required<Omit<User, "id">>;

                beforeEach(() => {
                    const candidate = users[2]; // anyone
                    if (!candidate) {
                        fail("could not continue testing: should have an user");
                    }

                    user = candidate;
                });

                it("should respond with authentication token", async () => {
                    const res = await req.auth(user.email, user.password).send();
                    const body = res.body as { data: string };

                    expect(res.status).toEqual(200);
                    expect(res.headers["content-type"]).toMatch(/json/i);
                    expect(body.data).toBeTruthy();
                });
            });

            describe("given invalid credentials", () => {
                let user: Required<Omit<User, "id">>;

                beforeEach(() => {
                    user = {name: "unknown", email: "unknown@email.com", password: "Unk1234!"};
                });

                it("should respond with error", async () => {
                    const res = await req.auth(user.email, user.password).send();
                    const body = res.body as { errors: { field: string, messages: string[] }[] };

                    expect(res.status).toEqual(400);
                    expect(res.headers["content-type"]).toMatch(/json/i);
                    expect(body.errors).toBeTruthy();
                    expect(body.errors).toEqual(
                        expect.arrayContaining([{
                            field: "authentication",
                            messages: [expect.stringMatching(/invalid credentials/i)]
                        }])
                    );
                });
            });

            describe("given badly formated credentials", () => {
                let authorization: string;

                beforeEach(() => {
                    authorization = "invalid";
                });

                it("should respond with errors given a request with badly formated basic authorization", async () => {
                    const res = await req.set("Authorization", authorization).send();
                    const body = res.body as { errors: { field: string, messages: string[] }[] };

                    expect(res.status).toEqual(400);
                    expect(res.headers["content-type"]).toMatch(/json/i);
                    expect(body.errors).toBeTruthy();
                    expect(body.errors).toEqual(
                        expect.arrayContaining([{
                            field: "authentication",
                            messages: [expect.stringMatching(/invalid request/i)]
                        }])
                    );
                });
            });
        });
    });
});
