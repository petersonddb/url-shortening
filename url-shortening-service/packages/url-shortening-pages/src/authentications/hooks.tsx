import {useContext} from "react";
import {AuthServiceContext} from "./contexts.ts";

/**
 * useAuthService provides an AuthService from context
 * or throws an error if none is found
 * @returns AuthService or throws an error
 */
export const useAuthService = () => {
    const authService = useContext(AuthServiceContext);

    if (!authService) {
        throw new Error("no auth service provided");
    }

    return authService;
}
