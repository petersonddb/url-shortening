/**
 * ValidationError is the list of error messages for a given field
 */
export interface ValidationError {
    field: string;
    messages: string[];
}

/**
 * ValidationErrors is a list of ValidationError
 */
export class ValidationErrors extends Error {
    readonly errors: ValidationError[];

    constructor(validationErrors: ValidationError[]) {
        super("Validation failed");

        this.errors = validationErrors;
    }
}

/**
 * AuthError points valid credentials are requirement
 */
export class AuthError extends Error {
}
