import {describe, expect, it} from "vitest";
import {ValidationErrors} from "./errors.ts";

describe("validation errors objects", () => {
    it("should be created with errors", () => {
        const errors = [
            {field: "any", messages: ["some error"]},
            {field: "any-other", messages: ["some more errors"]},
        ];
        const validationErrors = new ValidationErrors(errors);

        expect(validationErrors.errors).toHaveLength(2);
    });
});
