import {ValidationError} from "../errors/validations.js";

/**
 * SerializedError represents a prepared object
 * to be sent as response.
 */
export interface SerializedError {
    errors: { field: string; messages: string[] } [];
}

/**
 * serializeError prepares an error as an object
 * to be sent as response body.
 * @param field a name for the field property
 * @param err the error to be prepared
 */
export function serializeError(field: string, err: Error): SerializedError {
    return {errors: [{field: field, messages: [err.message]}]};
}

/**
 * serializeValidationError prepares a validation error
 * as an object to be sent as response body.
 * @param validationError the error to be prepared
 */
export function serializeValidationError(validationError: ValidationError): SerializedError {
    const validation = validationError.validation;

    return {errors: validation.failures.map((f) => ({field: f.field, messages: f.messages}))};
}
