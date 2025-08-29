import type {CreateUserParams, User, UserService} from "../users/users.ts";
import {ValidationErrors} from "../errors/errors.ts";

type RequestMessage = {
    data: {
        email: string
        password: string
    }
};

type ResponseMessage = {
    data: {
        id: string
        name: string
        email: string
    }
};

type ErrorResponseMessage = {
    errors: {
        field: string;
        messages: string[];
    }[];
}

/**
 * ApiUserService is a users service for the
 * url shortening service api
 */
export class ApiUserService implements UserService {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async create({email, password}: CreateUserParams): Promise<User> {
        console.info(`requesting service api to create new user for ${email}`);

        const userRequest: RequestMessage = {data: {email, password}};

        let response: Response;
        let json: Partial<ResponseMessage> & Partial<ErrorResponseMessage>;

        try {
            response = await fetch(`${this.baseUrl}/api/users`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(userRequest)
            });

            json = await response.json() as Partial<ResponseMessage> & Partial<ErrorResponseMessage>;
        } catch (err) {
            const message = err instanceof Error ? err.message : "unknown failure";

            throw new Error(`failed to create new user: server request failed: ${message}`);
        }

        const {data, errors} = json;

        if (response.ok) {
            if (data) {
                return data;
            }

            throw new Error("failed to create new user: invalid server response for created user");
        }

        // Validations failed
        if (errors && response.status === 422) {
            throw new ValidationErrors(errors);
        }

        const message = errors
            ?.map((e) => `${e.field}: ${e.messages.join(", ")}`)
            .join("\n") ?? "unknown details";

        throw new Error(`failed to create new user: status ${String(response.status)}: ${message}`);
    }
}
