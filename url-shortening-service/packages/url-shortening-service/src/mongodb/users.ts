import type {User, UserService} from "../users/users.js";
import {MongoClient} from "mongodb";
import type {AuthenticableService} from "../authentications/authentications.js";

/**
 * MongoDbUserService for users storage management at a mongodb server
 */
export class MongoDbUserService implements UserService, AuthenticableService {
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

    async findByEmail(email: string) {
        console.log(`finding user at mongodb by email for ${email}`);

        let user: User | null;
        try {
            user = await this.client
                .db(process.env.MONGODB_DB)
                .collection<User>("users")
                .findOne({email: email});
        } catch (err) {
            throw Error(`failed to find the authenticable user: query failed: ${err instanceof Error ? err : "unknown error"}`);
        }

        if (user?.name && user.email && user.password) {
            return {name: user.name, email: user.email, password: user.password};
        }

        return null;
    }
}
