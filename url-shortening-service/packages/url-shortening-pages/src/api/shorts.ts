import type {CreateShortParams, Short, ShortService} from "../shorts/shorts.ts";
import {ValidationErrors} from "../errors/errors.ts";

type RequestMessage = {
    data: {
        originalUrl: string;
    }
};

type CreateResponseMessage = {
    data: {
        hash: string;
        link: string;
        originalUrl: string;
        expire: string;
    }
}

type ListResponseMessage = {
    data: {
        hash: string;
        link: string;
        originalUrl: string;
        expire: string;
    }[];
}

type ErrorResponseMessage = {
    errors: {
        field: string;
        messages: string[];
    }[]
}

/**
 * ApiShortService is a short links service for the
 * url shortening service api
 */
export class ApiShortService implements ShortService {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async create({originalUrl}: CreateShortParams): Promise<Short> {
        console.log(`requesting service API a short link for ${originalUrl}`);

        const shortRequest: RequestMessage = {data: {originalUrl: originalUrl.toString()}};

        let response: Response;
        let json: Partial<CreateResponseMessage> & Partial<ErrorResponseMessage>;
        try {
            // TODO: Add auth information
            response = await fetch(`${this.baseUrl}/api/shorts`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(shortRequest),
            });

            json = await response.json() as Partial<CreateResponseMessage> & Partial<ErrorResponseMessage>;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "unknown failure";

            throw new Error(`failed to create new short: server request failed: ${message}`);
        }

        const {data, errors} = json;

        if (response.ok) {
            if (data) {
                return {
                    hash: data.hash,
                    link: new URL(data.link),
                    originalUrl: new URL(data.originalUrl),
                    expire: new Date(data.expire),
                } as Short;
            }

            throw new Error("failed to create new short: invalid server response for created short");
        }

        // Validations failed
        if (errors && response.status === 422) {
            throw new ValidationErrors(errors);
        }

        const message = errors
            ?.map((e) => `${e.field}: ${e.messages.join(", ")}`)
            .join("\n") ?? "unknown details";

        throw new Error(`failed to create new short: status ${String(response.status)}: ${message}`);
    }

    async list(): Promise<Short[]> {
        console.log(`requesting service API all short links`);

        let response: Response;
        let json: Partial<ListResponseMessage> & Partial<ErrorResponseMessage>;
        try {
            // TODO: Add auth information
            response = await fetch(`${this.baseUrl}/api/shorts`);

            json = await response.json() as Partial<ListResponseMessage> & Partial<ErrorResponseMessage>;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "unknown failure";

            throw new Error(`failed to list shorts: server request failed: ${message}`);
        }

        const {data, errors} = json;
        if (response.ok) {
            if (data) {
                return data.map(short => (
                    {
                        hash: short.hash,
                        link: new URL(short.link),
                        originalUrl: new URL(short.originalUrl),
                        expire: new Date(short.expire),
                    } as Short
                ));
            }

            throw new Error("failed to list shorts: invalid server response for shorts list");
        }

        const message = errors
            ?.map((e) => `${e.field}: ${e.messages.join(", ")}`)
            .join("\n") ?? "unknown details";

        throw new Error(`failed to list shorts: status ${String(response.status)}: ${message}`);
    }
}
