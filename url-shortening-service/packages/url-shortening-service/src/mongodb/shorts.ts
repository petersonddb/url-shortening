import type {Short, ShortService} from "../shorts/shorts.js";
import {MongoClient} from "mongodb";

/**
 * MongoDbShortService for shorts storage management at a mongodb server
 */
export class MongoDbShortService implements ShortService {
    private readonly client: MongoClient;

    constructor(client: MongoClient) {
        this.client = client;
    }

    async create(short: Short) {
        console.log(`creating short for URL ${short.originalUrl ?? "no URL"} into mongodb`);

        try {
            await this.client
                .db(process.env.MONGODB_DB)
                .collection<Short>("shorts")
                .insertOne(short);
        } catch (err: unknown) {
            throw Error(`failed to store new short: ${err instanceof Error ? err : "unknown error"}`);
        }

        return short;
    }

    list(): Promise<Short[]> {
        console.log(`listing shorts from mongodb`);

        throw new Error("not implemented");
    }
}
