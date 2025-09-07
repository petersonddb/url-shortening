import {createContext} from "react";
import type {AuthService} from "./authentications.ts";

/**
 * AuthServiceContext for AuthService dependency
 */
export const AuthServiceContext =
    createContext<AuthService | null>(null);
