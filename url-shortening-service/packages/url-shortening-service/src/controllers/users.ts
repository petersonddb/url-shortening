import {type Request, type Response} from "express";
import {createUser, type User, UserValidationError} from "../users/users.js";
import {serializeError, type SerializedError} from "./serializers.js";

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
            return res.status(400).json(
                {errors: [{field: "user", messages: ['invalid request, should have user data']}]});
        }

        createUser(data, req.userService).then((user: User) => {
            return res.status(201).json(serializeUser(user));
        }).catch((err: unknown) => {
            if (err instanceof UserValidationError) {
                return res.status(422).json(serializeUserValidationError(err));
            }

            res.status(500).json(serializeError("user", err instanceof Error ? err : Error("unknown error")));
        })
    }
}

interface SerializedUser {
    data: Pick<User, "id" | "email" | "name">
}

function serializeUser(user: User): SerializedUser {
    return {data: {id: user.id ?? "", email: user.email ?? "", name: user.name ?? ""}};
}

function serializeUserValidationError(validationError: UserValidationError): SerializedError {
    const validation = validationError.validation;

    return {errors: validation.failures.map((f) => ({field: f.field, messages: f.messages}))};
}
