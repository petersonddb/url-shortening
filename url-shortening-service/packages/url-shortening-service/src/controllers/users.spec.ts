import {it, describe, expect} from "vitest";
import request from "supertest";
import {app} from "../../index.js";
import {faker} from "@faker-js/faker/locale/en";

describe("users API", () => {
    const api = request(app);

    describe("POST /api/users", () => {
        it("should respond with created user when success", async () => {
            const res = await api.post('/api/users').send({
                data: {
                    email: faker.internet.email(),
                    password: "Pass123!"
                }
            })

            const body = res.body as { data: { id: string, name: string, email: string } };

            expect(res.status).toEqual(201);
            expect(res.headers["content-type"]).toMatch(/json/);
            expect(body.data).toBeTruthy();
            expect(Object.keys(body.data)).toEqual(["id", "email", "name"]);
            expect(body.data.id).toBeTruthy();
        });

        it("should respond with errors given a badly formated request", async () => {
            const res = await api.post('/api/users').send({format: "bad"});
            const body = res.body as { errors: { field: string, messages: string[] }[] };

            expect(res.status).toEqual(400);
            expect(res.headers["content-type"]).toMatch(/json/);
            expect(body.errors).toBeTruthy();
            expect(body.errors).toEqual(
                expect.arrayContaining([{
                    field: "user",
                    messages: [expect.stringMatching(/invalid request/)]
                }])
            );
        });

        it("should respond with validation errors given some invalid user property", async () => {
            const res = await api.post('/api/users').send({data: {email: "invalid", password: "invalid"}});
            const body = res.body as { errors: { field: string, messages: string[] }[] };

            expect(res.status).toEqual(422);
            expect(res.headers["content-type"]).toMatch(/json/);
            expect(body.errors).toBeTruthy();
            expect(body.errors).toEqual(
                expect.arrayContaining([
                    {
                        field: "email",
                        messages: [expect.stringMatching(/should be a valid email/)]
                    },
                    {
                        field: "password",
                        messages: [expect.stringMatching(/at least 8 characters/)]
                    }
                ])
            );
        });
    });
});
