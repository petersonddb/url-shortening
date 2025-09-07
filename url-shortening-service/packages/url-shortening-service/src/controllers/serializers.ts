export interface SerializedError {
    errors: { field: string; messages: string[] } [];
}

export function serializeError(field: string, err: Error): SerializedError {
    return {errors: [{field: field, messages: [err.message]}]};
}
