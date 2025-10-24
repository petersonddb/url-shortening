import type {Authenticated, AuthenticateParams, AuthService, AuthToken} from "../authentications/authentications.ts";
import {jwtDecode} from "jwt-decode";
import type {JwtPayload} from "jsonwebtoken";

type ResponseMessage = {
    data: string
}

type ErrorResponseMessage = {
    errors: {
        field: string;
        messages: string[];
    }[];
}

/**
 * ApiAuthService is an authentication service for the
 * url shortening service api
 */
export class ApiAuthService implements AuthService {
    private readonly baseUrl: string;

    private latestAuthorization: string | null;
    private latestAuthenticated: Authenticated | null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.latestAuthorization = null;
        this.latestAuthenticated = null;
    }

    get authenticated(): Authenticated | null {
        return this.latestAuthenticated;
    }

    get authorization(): string | null {
        if (this.latestAuthorization == null) {
            return null;
        }

        return `Bearer ${this.latestAuthorization}`;
    }

    async authenticate({email, password}: AuthenticateParams): Promise<AuthToken> {
        console.info(`sending user ${email} authentication request to the api`);

        // remove past authentication data
        this.latestAuthorization = null;
        this.latestAuthenticated = null;

        const credentials = btoa(`${email}:${password}`);

        let response: Response;
        let json: Partial<ResponseMessage> & Partial<ErrorResponseMessage>;

        try {
            response = await fetch(`${this.baseUrl}/api/authentications`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${credentials}`
                },
            });

            json = await response.json() as Partial<ResponseMessage> & Partial<ErrorResponseMessage>;
        } catch (err) {
            const message = err instanceof Error ? err.message : "unknown failure";

            throw new Error(`failed to authenticate user: server request failed: ${message}`);
        }

        const {data, errors} = json;

        if (response.ok) {
            if (data) {
                let decodedToken: JwtPayload & {name?: string};
                try {
                    decodedToken = jwtDecode(data);
                } catch (err: unknown) {
                    throw Error(`failed to authenticate user: failed to decode authenticated user: ${err instanceof Error ? err : "unknown failure"}`);
                }

                if (
                    typeof decodedToken === "object" &&
                    typeof decodedToken.name === "string" &&
                    decodedToken.sub != null
                ) {
                    this.latestAuthorization = data;
                    this.latestAuthenticated = {id: decodedToken.sub, name: decodedToken.name};
                } else {
                    throw Error("failed to authenticate user: failed to decode authentication user: bad formatted token");
                }

                return data;
            }

            throw new Error("failed to authenticate user: invalid server response for authenticated user");
        }

        // Authentication failed
        const message = errors
            ?.map((e) => `${e.field}: ${e.messages.join(", ")}`)
            .join("\n") ?? "unknown details";

        throw new Error(`failed to authenticate user: status ${String(response.status)}: ${message}`);
    }
}
