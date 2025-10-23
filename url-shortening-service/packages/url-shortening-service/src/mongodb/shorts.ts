import type {Short, ShortService} from "../shorts/shorts.js";
import {MongoClient} from "mongodb";

type MongodbShort = Omit<Short, "originalUrl"> & {
    originalUrl?: string;
}

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

        const mongoDbShort: MongodbShort =
            short.originalUrl ? {
                ...short,
                originalUrl: short.originalUrl.toString()
            } : short as Omit<MongodbShort, "originalUrl">;

        try {
            await this.client
                .db(process.env.MONGODB_DB)
                .collection<MongodbShort>("shorts")
                .insertOne(mongoDbShort);
        } catch (err: unknown) {
            throw Error(`failed to store new short: ${err instanceof Error ? err : "unknown error"}`);
        }

        return short;
    }

    async list(userId: string): Promise<Short[]> {
        console.log(`listing shorts from mongodb`);

        let shorts: MongodbShort[];
        try {
            const res = this.client
                .db(process.env.MONGODB_DB)
                .collection<MongodbShort>("shorts")
                .find({userId: userId});

            shorts = await res.toArray(); // NOTE: it might be faster if we return the cursor itself
        } catch (err: unknown) {
            throw Error(`failed to get shorts: ${err instanceof Error ? err : "unknown error"}`);
        }

        return shorts.map((mongoDbShort): Short => (
            mongoDbShort.originalUrl ? {
                ...mongoDbShort,
                originalUrl: new URL(mongoDbShort.originalUrl)
            } : mongoDbShort as Omit<MongodbShort, "originalUrl">
        ));
    }

    async findByHash(hash: string): Promise<Short | null> {
        console.log(`looking for a short link for hash ${hash} in mongodb`);

        let short: MongodbShort | null;
        try {
            short = await this.client
                .db(process.env.MONGODB_DB)
                .collection<MongodbShort>("shorts")
                .findOne({hash: hash});
        } catch (err: unknown) {
            throw Error(`failed to find short: ${err instanceof Error ? err : "unknown error"}`);
        }

        if (short == null) {
            return null;
        }

        return short.originalUrl ? {
            ...short,
            originalUrl: new URL(short.originalUrl)
        } : short as Omit<Short, "originalUrl">;
    }
}
