import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export type AuthToken = string;

/**
 * Authenticable represents a user
 */
export interface Authenticable {
    name: string;
    email: string;

    /**
     * bcrypt-encrypted secret
     */
    password: string;
}

/**
 * AuthenticableService access an authenticable
 */
export interface AuthenticableService {
    findByEmail(email: string): Promise<Authenticable | null>;
}

export interface AuthenticateParams {
    email: string;
    password: string;
}

/**
 * authenticate using credentials against an authenticable (e.g. user)
 * @param email
 * @param password
 * @param authenticableService
 * @returns an authentication token
 */
export async function authenticate({email, password}: AuthenticateParams, authenticableService: AuthenticableService) {
    // TODO: move these configuration accesses into a configs module
    const jwtKey = process.env.JWT_SECRET;
    if (!jwtKey) {
        throw Error("failed to authenticate user:: invalid server configuration: missing keys");
    }

    let authenticable;
    try {
        authenticable = await authenticableService.findByEmail(email);
    } catch (err) {
        throw Error(`failed to authenticate user: authenticable service failed: ${err instanceof Error ? err : "unknown error"}`);
    }

    if (!authenticable) {
        throw Error("failed to authenticate user: invalid credentials");
    }

    let match;
    try {
        match = await bcrypt.compare(password, authenticable.password);
    } catch (err) {
        throw Error(`failed to authenticate user: could not hash password: ${err instanceof Error ? err : "unknown error"}`);
    }

    if (!match) {
        throw Error("failed to authenticate user: invalid credentials");
    }

    return jwt.sign(
        {aud: "url-shortening", sub: authenticable.name, ema: authenticable.email},
        jwtKey,
        {expiresIn: "1y"}
    );
}
