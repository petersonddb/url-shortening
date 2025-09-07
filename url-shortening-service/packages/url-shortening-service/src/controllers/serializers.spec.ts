import {describe, expect, it} from "vitest";
import {serializeError} from "./serializers.js";

describe("serializers for errors", () => {
    const serializer = serializeError;

    describe("given an error object", () => {
        let error: Error;

        it('should properly properly structure it to a common format', () => {
            error = Error("some error message");

            const got = serializer("test", error);

            expect(got.errors).toBeTruthy();
            expect(got.errors).toEqual(
                expect.arrayContaining([
                    {
                        field: "test",
                        messages: [expect.stringMatching(/some error message/i)]
                    }
                ])
            );
        });
    });
});
