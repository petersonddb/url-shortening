import {beforeEach, describe, expect, it} from "vitest";
import {type ValidationError, ValidationErrors} from "./errors.ts";

describe("validation errors objects", () => {
    it("should be created with no errors and proper message", () => {
        const validationErrors = new ValidationErrors();

        expect(validationErrors.errors).toHaveLength(0);
        expect(validationErrors.message).toMatch(/validation.*failed/i);
    });

    it("should be possible to append errors", () => {
        const validationErrors = new ValidationErrors();

        validationErrors.append({field: "any", messages: ["any-message"]});

        expect(validationErrors.errors).toHaveLength(1);

        const { field, messages } = validationErrors.errors[0];
        expect(field).toEqual("any");
        expect(messages).toContain("any-message");
    });

    describe("when there are some validation errors", () => {
        let validationErrors: ValidationErrors;
        let errors: ValidationError[];

        beforeEach(() => {
            validationErrors = new ValidationErrors();
            errors = [
                {field: "any", messages: ["some error"]},
                {field: "any-other", messages: ["some more errors"]},
            ];

            for (const err of errors) {
                validationErrors.append(err);
            }
        });

        it("should be possible to append more errors", () => {
            validationErrors.append({field: "new", messages: []});

            expect(validationErrors.errors).toHaveLength(3);
            expect(validationErrors.errors.map((err) => err.field)).toContain("new");
        });

        it("will NOT treat duplicated fields", () => {
            validationErrors.append({field: "any", messages: []});

            expect(validationErrors.errors).toHaveLength(3);
            expect(validationErrors.errors.filter((err) => err.field === "any")).toHaveLength(2);
        });
    });
});
