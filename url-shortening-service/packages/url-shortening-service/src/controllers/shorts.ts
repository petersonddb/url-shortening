import {type Request, type Response} from "express";
import {serializeError, serializeValidationError} from "./serializers.js";
import {ValidationError} from "../errors/validations.js";
import {createShort, getLink, type Short} from "../shorts/shorts.js";

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

        createShort({originalUrl, userId: req.authenticated?.id ?? ""}, req.keyService, req.shortService).then((short) => {
            res.status(201).json(serializeShort(short, req.baseRedirectionUrl));
        }).catch((err: unknown) => {
            res.status(500).json(serializeError("short", err instanceof Error ? err : new Error("failed to create short link")));
        });
    },

    list: (req: Request, res: Response) => {
        if (!req.shortService) {
            throw new Error("failed to handle request: service not available");
        }

        req.shortService.list(req.authenticated?.id ?? "").then((shorts) => {
            res.json(serializeShorts(shorts, req.baseRedirectionUrl));
        }).catch((err: unknown) => {
            res.status(500).json(serializeError("short", err instanceof Error ? err : new Error("failed to list short links")));
        });
    }
};

interface SerializedShort {
    data: {
        hash: string;
        link: string;
        originalUrl: string;
        expire: string;
        userId: string;
    }
}

interface SerializedShorts {
    data: {
        hash: string;
        link: string;
        originalUrl: string;
        expire: string;
        userId: string;
    }[]
}

function serializeShort(short: Short, withBaseRedirectionUrl = ""): SerializedShort {
    return {
        data: {
            hash: short.hash ?? "",
            link: withBaseRedirectionUrl ? getLink(short, withBaseRedirectionUrl)?.toString() ?? "" : "",
            originalUrl: short.originalUrl?.toString() ?? "",
            expire: short.expire?.toISOString() ?? "",
            userId: short.userId ?? ""
        }
    };
}

function serializeShorts(shorts: Short[], withBaseRedirectionUrl = ""): SerializedShorts {
    return {data: shorts.map(short => serializeShort(short, withBaseRedirectionUrl).data)};
}
