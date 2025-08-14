import {useContext} from "react";
import {UserServiceContext} from "./contexts.ts";

/**
 * useUserService provides a UserService from context
 * or throws an error if none is found
 * @returns UserService or throws an error
 */
export const useUserService = () => {
    const userService = useContext(UserServiceContext);

    if (!userService) {
        throw new Error('no user service provided');
    }

    return userService;
};
