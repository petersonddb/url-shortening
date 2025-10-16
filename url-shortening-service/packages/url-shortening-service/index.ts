import express, {type NextFunction, type Request, type Response} from 'express';
import users from "./src/controllers/users.js";
import cors from "cors";
import morgan from "morgan";
import {MongoDbUserService} from "./src/mongodb/users.js";
import {MongoClient} from "mongodb";
import type {UserService} from "./src/users/users.js";
import authentications from "./src/controllers/authentications.js";
import type {AuthenticableService} from "./src/authentications/authentications.js";
import shorts from "./src/controllers/shorts.js";
import type {ShortService} from "./src/shorts/shorts.js";
import {MongoDbShortService} from "./src/mongodb/shorts.js";
import grpc from "@grpc/grpc-js";
import {KeygenKeyService} from "./src/keygen-service/keys.js";
import type {KeyService} from "./src/keys/keys.js";
import {KeysClient} from "./src/keygen-service/keys-contract_grpc_pb.js";
import redirectShortLink from "./src/controllers/redirections.js";
import jwt from "jsonwebtoken";

export const app = express();
const port = parseInt(process.env.PORT ?? '3000');

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [],
    methods: ["POST"],
    credentials: true,
};

app.use(morgan("combined"));
app.use(cors(corsOptions));
app.use(express.json());

declare module "express-serve-static-core" {
    interface Request {
        userService?: UserService;
        authenticableService?: AuthenticableService;
        shortService?: ShortService;
        keyService?: KeyService;

        authenticated?: { id: string; name: string };

        baseRedirectionUrl?: string;
    }
}

if (!process.env.MONGODB_SERVER) {
    throw new Error("could not configure mongodb: connection string is missing");
}

const mongoDbClient = new MongoClient(process.env.MONGODB_SERVER);
const userAuthService = new MongoDbUserService(mongoDbClient);
const shortService = new MongoDbShortService(mongoDbClient);

if (!process.env.KEYGEN_SERVICE_URL) {
    throw new Error("could not configure keygen client: service url is missing");
}

const keysClient = new KeysClient(process.env.KEYGEN_SERVICE_URL, grpc.credentials.createInsecure());
const keyService = new KeygenKeyService(keysClient);

if (!process.env.BASE_REDIRECTION_URL) {
    throw new Error("could not configure redirections: base redirection url is missing");
}

const baseRedirectionUrl = process.env.BASE_REDIRECTION_URL;

if (!process.env.JWT_SECRET) {
    throw new Error("could not configure protected routes: jwt secret is missing");
}

const jwtToken = process.env.JWT_SECRET;

const authorize = ((req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({});

        return;
    }

    const token = authorization.split(" ")[1];
    if (!token) {
        res.status(401).json({});

        return;
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, jwtToken);
    } catch {
        res.status(401).json({});
    }

    if (typeof decodedToken === "object" && decodedToken.sub != null && typeof decodedToken.name === "string") {
        req.authenticated = {id: decodedToken.sub, name: decodedToken.name};

        next();
        return;
    }

    res.status(401).json({});
});

app.use((req, _res, next) => {
    req.userService = userAuthService;
    req.authenticableService = userAuthService;
    req.shortService = shortService;
    req.keyService = keyService;
    req.baseRedirectionUrl = baseRedirectionUrl;

    next();
});

process.on("SIGINT", () => {
    console.info("cleaning up resources: closing mongodb client");

    mongoDbClient.close().catch((err: unknown) => {
        console.error(`could not close mongodb client connection properly: ${err instanceof Error ? err.message : "unknown error"}`);
    });
});

// API routes
app.post("/api/users", users.create);
app.post("/api/authentications", authentications.create);

app.post("/api/shorts", authorize, shorts.create);
app.get("/api/shorts", authorize, shorts.list);

// Redirections route
app.get("/r/:hash", redirectShortLink);

app.listen(port, () => {
    console.info(`listening on port ${port.toString()}`);
})
