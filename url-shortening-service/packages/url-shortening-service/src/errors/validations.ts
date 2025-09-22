/**
 * Validation results for an entity
 */
export interface Validation {
    valid: boolean;
    failures: {
        field: string;
        messages: string[];
    }[];
}

/**
 * ValidationError to be thrown when the validation
 * of an entity fails
 */
export class ValidationError extends Error {
    validation: Validation;

    constructor(validation: Validation) {
        super("validation failed");

        this.validation = validation;
    }
}
