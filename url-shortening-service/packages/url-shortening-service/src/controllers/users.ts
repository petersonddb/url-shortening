import {type Request, type Response} from "express";
import {createUser, type User} from "../users/users.js";
import {serializeError, serializeValidationError} from "./serializers.js";
import {ValidationError} from "../errors/validations.js";

interface CreateRequest {
    data: {
        email: string;
        password: string;
    }
}

export default {
    create: (req: Request, res: Response) => {
        if (!req.userService) {
            throw new Error("failed to handle request: service not available");
        }

        const {data} = req.body as Partial<CreateRequest>;
        if (!data) {
            res.status(400).json({errors: [{field: "user", messages: ['invalid request, should have user data']}]});

            return;
        }

        createUser(data, req.userService).then((user: User) => {
            res.status(201).json(serializeUser(user));

            return;
        }).catch((err: unknown) => {
            if (err instanceof ValidationError) {
                res.status(422).json(serializeValidationError(err));

                return;
            }

            res.status(500).json(serializeError("user", err instanceof Error ? err : Error("unknown error")));
        });
    }
}

interface SerializedUser {
    data: Pick<User, "id" | "email" | "name">
}

function serializeUser(user: User): SerializedUser {
    return {data: {id: user.id ?? "", email: user.email ?? "", name: user.name ?? ""}};
}

