import type {KeyService} from "../keys/keys.js";
import {type Validation, ValidationError} from "../errors/validations.js";

/**
 * Short represents a short link for some URL
 */
export interface Short {
    hash?: string;
    originalUrl?: URL;
    expire?: Date;
    userId?: string;
}

/**
 * isShortExpired determines whether a short link
 * is expired or not
 * @param short to verify
 */
export function isShortExpired(short: Short): boolean {
    if (short.expire == null) {
        return true;
    }

    return short.expire <= new Date();
}

/**
 * getLink based on given short and base url
 * @param short including a hash to construct the link
 * @param baseUrl including the path to construct the link
 * @return a link formed from the base url and existent short hash, null otherwise
 */
export function getLink(short: Short, baseUrl: string): URL | null {
    if (!short.hash) {
        return null;
    }

    return new URL(`${baseUrl}/${short.hash}`);
}

/**
 * ShortService for short links storage access
 */
export interface ShortService {
    create(short: Short): Promise<Short>;

    list(userId: string): Promise<Short[]>;

    findByHash(hash: string): Promise<Short | null>;
}


/**
 * validateShortAll against all checks
 * @param short to be validated
 * @returns validation results
 */
export function validateShortAll(short: Short): Validation {
    return validateShortUserId(short);
}

export function validateShortUserId(short: Short): Validation {
    const validation: Validation = {valid: true, failures: []};

    if (!short.userId) {
        validation.failures.push({field: "userId", messages: ["should not be empty"]});
    }

    validation.valid = validation.failures.length === 0;
    return validation;
}

/**
 * CreateShortParams for `createShort`
 */
export interface CreateShortParams {
    originalUrl: URL;
    userId: string;
}

/**
 * createShort using given originalUrl preparing with
 * an expiration date and the hash key to be used in the
 * short link
 * @param shortParams to generate the short as the link for the original url and an owning user
 * @param keyService to allocate keys for the hash
 * @param shortService to store the new short link
 * @return the created short
 */
export async function createShort(shortParams: CreateShortParams, keyService: KeyService, shortService: ShortService) {
    const expire = new Date();
    expire.setFullYear(expire.getFullYear() + 1);

    const short: Short = {...shortParams, expire};

    const validation = validateShortAll(short);
    if (!validation.valid) {
        throw new ValidationError(validation);
    }

    try {
        short.hash = await keyService.allocate();
    } catch (err: unknown) {
        throw Error(`failed to create short: key service failed: ${err instanceof Error ? err : "unknown error"}`);
    }

    try {
        return await shortService.create(short);
    } catch (err: unknown) {
        await keyService.deallocate(short.hash).catch(() => {
            return; // nothing to do about it
        });

        throw Error(`failed to create short: short service failed: ${err instanceof Error ? err : "unknown error"}`);
    }
}
