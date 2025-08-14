/**
 * ValidationError is the list of error messages for a given field
 */
export type ValidationError = {
    field: string;
    messages: string[];
};

/**
 * ValidationErrors is a list of ValidationError
 */
export class ValidationErrors extends Error {
    private readonly _errors: ValidationError[];

    constructor() {
        super("Validation failed");

        this._errors = [];
    }

    get errors(): ValidationError[] {
        return this._errors;
    }

    /**
     * append a new ValidationError
     * @param err the ValidationError to be appended
     */
    append(err: ValidationError) {
        this._errors.push(err);
    }
}
