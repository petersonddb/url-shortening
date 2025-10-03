import express from 'express';
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

app.use((req, _res, next) => {
    req.userService = userAuthService;
    req.authenticableService = userAuthService;
    req.shortService = shortService;
    req.keyService = keyService;

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
app.post("/api/shorts", shorts.create);

app.listen(port, () => {
    console.info(`listening on port ${port.toString()}`);
})
