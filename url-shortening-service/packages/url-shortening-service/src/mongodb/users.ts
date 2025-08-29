import type {User, UserService} from "../users/users.js";
import {MongoClient} from "mongodb";

/**
 * MongoDbUserService for users storage management at a mongodb server
 */
export class MongoDbUserService implements UserService {
    private readonly client: MongoClient;

    constructor(client: MongoClient) {
        this.client = client;
    }

    async create(user: User) {
        console.info(`creating user at mongodb for ${user.email ?? "<no email>"}`);

        try {
            const result = await this.client
                .db(process.env.MONGODB_DB)
                .collection<User>("users")
                .insertOne(user);

            user.id = result.insertedId.toString();
        } catch (err) {
            throw Error(`failed to store new user: ${err instanceof Error ? err : "unknown error"}`);
        }

        return user;
    }
}
