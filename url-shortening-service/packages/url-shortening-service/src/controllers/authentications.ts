import {type Request, type Response} from "express";
import {authenticate} from "../authentications/authentications.js";
import {serializeError} from "./serializers.js";

export default {
    create: (req: Request, res: Response) => {
        if (!req.authenticableService) {
            throw new Error("failed to handle request: service not available");
        }

        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(400).json(serializeError("authentication", Error("invalid request, should have basic authorization")));
        }

        let email, password;
        try {
            [email, password] = Buffer
                .from(auth.replace("Basic", ""), "base64")
                .toString()
                .trim()
                .split(':');
        } catch {
            return res.status(400).json(serializeError("authentication", Error("invalid request, should have basic authorization")));
        }

        if(!(email && password)) {
            return res.status(400).json(serializeError("authentication", Error("invalid request, should have basic authorization")));
        }

        authenticate({email, password}, req.authenticableService).then((authToken) => {
            res.status(200).json({data: authToken});
        }).catch((err: unknown) => {
            res.status(400).json(serializeError("authentication", err instanceof Error ? err : Error("unknown error")));
        });
    }
}
