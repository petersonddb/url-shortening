import express from 'express';
import users from "./src/controllers/users.js";
import cors from "cors";
import morgan from "morgan";
import {MongoDbUserService} from "./src/mongodb/users.js";
import {MongoClient} from "mongodb";
import type {UserService} from "./src/users/users.js";

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

// document database
declare module "express-serve-static-core" {
    interface Request {
        userService?: UserService;
    }
}

if (!process.env.MONGODB_SERVER) {
    throw new Error("could not configure mongodb: connection string is missing");
}

const mongoDbClient = new MongoClient(process.env.MONGODB_SERVER);
const userService = new MongoDbUserService(mongoDbClient);

app.use((req, _res, next) => {
    req.userService = userService;

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

app.listen(port, () => {
    console.info(`listening on port ${port.toString()}`);
})
