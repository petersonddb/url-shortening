import type {KeyService} from "../keys/keys.js";

/**
 * Short represents a short link for some URL
 */
export interface Short {
    hash?: string;
    originalUrl?: URL;
    expire?: Date;
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
 * ShortService for short links storage access
 */
export interface ShortService {
    create(short: Short): Promise<Short>;

    list(): Promise<Short[]>;

    findByHash(hash: string): Promise<Short | null>;
}


/**
 * CreateShortParams for `createShort`
 */
export interface CreateShortParams {
    originalUrl: URL;
}

/**
 * createShort using given originalUrl preparing with
 * an expiration date and the hash key to be used in the
 * short link
 * @param originalUrl to generate a short link for
 * @param keyService to allocate keys for the hash
 * @param shortService to store the new short link
 * @return the created short
 */
export async function createShort({originalUrl}: CreateShortParams, keyService: KeyService, shortService: ShortService) {
    const expire = new Date();
    expire.setFullYear(expire.getFullYear() + 1);

    const short: Short = {originalUrl, expire};

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
