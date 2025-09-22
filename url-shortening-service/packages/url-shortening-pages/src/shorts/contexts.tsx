import {createContext} from "react";
import type {ShortService} from "./shorts.ts";

/**
 * ShortServiceContext for ShortService dependency
 */
export const ShortServiceContext =
    createContext<ShortService | null>(null);
