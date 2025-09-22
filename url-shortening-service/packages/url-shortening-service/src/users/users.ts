import bcrypt from "bcrypt";
import {type Validation, ValidationError} from "../errors/validations.js";

export interface User {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
}

/**
 * UserService for a user storage access
 */
export interface UserService {
    create(user: User): Promise<User>;
}


const EmailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PasswordMinLength = 8;
const PasswordFormats = [/[a-z]+/, /[A-Z]/, /[0-9]+/, /[!@#$%&*.,_=+]+/];

const validations = [
    validateUserEmail,
    validateUserPassword,
]

/**
 * validateUserAll against all checks
 * @param user to be validated
 * @returns validation results
 */
export function validateUserAll(user: User): Validation {
    const failures = validations
        .map((validation) => validation(user).failures)
        .filter((v) => v.length > 0)
        .flat();

    return {valid: failures.length === 0, failures};
}

export function validateUserEmail(user: User): Validation {
    const email = user.email;
    let failure: { field: string, messages: string[] } | undefined;

    const messages: string[] = [];
    if (!email) {
        messages.push('email address should not be empty, e.g. peter@email.com');
    } else if (!EmailFormat.test(email)) {
        messages.push('email address should be a valid email, e.g. peter@email.com');
    }

    if (messages.length > 0) {
        failure = {field: 'email', messages: messages};
    }

    return {valid: failure == null, failures: failure != null ? [failure] : []};
}

export function validateUserPassword(user: User): Validation {
    const password = user.password;
    let failure: { field: string, messages: string[] } | undefined;

    const messages: string[] = [];
    if (!password || password.length < PasswordMinLength) {
        messages.push(`password should have at least ${PasswordMinLength.toString()} characters`);
    } else {
        if (PasswordFormats.some(format => !format.test(password))) {
            messages.push("password should have numbers, symbols, lower and upper case characters");
        }
    }

    if (messages.length > 0) {
        failure = {field: 'password', messages: messages};
    }

    return {valid: failure == null, failures: failure != null ? [failure] : []};
}


export interface CreateUserParams {
    email: string;
    password: string;
}

/**
 * createUser using given userService, properly validated
 * and further prepared with inferred data
 * @param email a valid email address
 * @param password a secure password
 * @param userService external storage service
 * @returns the created and persisted user with a unique identification
 */
export async function createUser({email, password}: CreateUserParams, userService: UserService) {
    const user: User = {email, password};

    // try to infer name from email
    user.name = email.split('@')[0] ?? "";

    const validation = validateUserAll(user);
    if (!validation.valid) {
        throw new ValidationError(validation);
    }

    // hash the password
    try {
        user.password = await bcrypt.hash(password, 10);
    } catch(err) {
        throw Error(`failed to create user: could not hash password: ${err instanceof Error ? err : "unknown error"}`);
    }

    try {
        return await userService.create(user);
    } catch(err) {
        throw Error(`failed to create user: service failed: ${err instanceof Error ? err : "unknown error"}`);
    }
}
