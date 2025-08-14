import {createContext} from "react";
import {type UserService} from "./users.ts";

/**
 * UserServiceContext for UserService dependency
 */
export const UserServiceContext =
    createContext<UserService | null>(null);
