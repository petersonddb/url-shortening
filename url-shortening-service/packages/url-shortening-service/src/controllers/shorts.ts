import {type Request, type Response} from "express";
import {serializeError, serializeValidationError} from "./serializers.js";
import {ValidationError} from "../errors/validations.js";
import {createShort, type Short} from "../shorts/shorts.js";

interface CreateRequest {
    data: {
        originalUrl: string;
    }
}

export default {
    create: (req: Request, res: Response) => {
        if (!(req.shortService && req.keyService)) {
            throw new Error("failed to handle request: service not available");
        }

        const {data} = req.body as Partial<CreateRequest>;
        if (!data) {
            res.status(400).json({errors: [{field: "short", messages: ['invalid request, should have short data']}]});

            return;
        }

        let originalUrl: URL;
        try {
            originalUrl = new URL(data.originalUrl);
        } catch (err: unknown) {
            res.status(422).json(serializeValidationError(new ValidationError({
                valid: false,
                failures: [{
                    field: "originalUrl",
                    messages: [`should be a valid URL: ${err instanceof Error ? err.message : "unknown error"}`]
                }]
            })));

            return;
        }

        createShort({originalUrl}, req.keyService, req.shortService).then((short) => {
            res.status(201).json(serializeShort(short));
        }).catch((err: unknown) => {
            res.status(500).json(serializeError("short", err instanceof Error ? err : new Error("failed to create short link")));
        });
    },

    list: (req: Request, res: Response) => {
        if (!req.shortService) {
            throw new Error("failed to handle request: service not available");
        }

        req.shortService.list().then((shorts) => {
            res.json(serializeShorts(shorts));
        }).catch((err: unknown) => {
            res.status(500).json(serializeError("short", err instanceof Error ? err : new Error("failed to list short links")));
        });
    }
};

interface SerializedShort {
    data: {
        hash: string;
        originalUrl: string;
        expire: string;
    }
}

interface SerializedShorts {
    data: {
        hash: string;
        originalUrl: string;
        expire: string;
    }[]
}

function serializeShort(short: Short): SerializedShort {
    return {
        data: {
            hash: short.hash ?? "",
            originalUrl: short.originalUrl?.toString() ?? "",
            expire: short.expire?.toISOString() ?? ""
        }
    };
}

function serializeShorts(shorts: Short[]): SerializedShorts {
    return { data: shorts.map(short => serializeShort(short).data ) }
}
