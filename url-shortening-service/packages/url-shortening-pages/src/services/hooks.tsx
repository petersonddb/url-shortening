import {type Context, useContext} from "react";

/**
 * useService provides a service from context
 * or throws an error if none is found
 * @param context for the service T
 * @returns the found service, or throws an error
 */
export const useService = <T,>(context: Context<T | null>): T => {
    const service = useContext(context);

    if (!service) {
        throw new Error("service not provided");
    }

    return service;
}
