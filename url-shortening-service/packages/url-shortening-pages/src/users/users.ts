import {ValidationErrors} from "../errors/errors.ts";

/**
 * User represents a user data
 */
export type User = {
    id: string;
    name: string;
    email: string;
};

/**
 * CreateUserParams for `UserService.create`
 */
export type CreateUserParams = {
    email: string;
    password: string;
}

/**
 * UserService provides interaction with users data
 */
export interface UserService {
    create({ email, password }: CreateUserParams): Promise<User>;
}

/**
 * DummyUserService is used to mock UserService with fake users data
 */
export class DummyUserService implements UserService {
    async create({ email }: CreateUserParams) {
        console.log(`creating new user: ${email}`);

        return new Promise<User>((resolve, reject) => {
            setTimeout(() => {
                if (email === "error@email.com") {
                    const validationErrors = new ValidationErrors();
                    validationErrors.append({ field: "email", messages: ["invalid email"] });

                    reject(validationErrors);

                    return;
                }

                if (email === "fail@email.com") {
                    reject(Error(`Failed to create user for email: ${email}`));

                    return;
                }

                resolve({ id: "dummy-id", name: "dummy-name", email: email });
            }, 2 * 1000);
        });
    }
}
