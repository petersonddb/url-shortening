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
