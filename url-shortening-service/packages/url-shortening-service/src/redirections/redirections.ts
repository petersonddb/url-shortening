import {isShortExpired, type Short, type ShortService} from "../shorts/shorts.js";

/**
 * getRedirectionUrl find and return an original url
 * for a given short link hash, if existent and not expired
 * @param hash for short link (path)
 * @param shortService to access short links data
 * @return an active original url found, null otherwise
 */
export async function getRedirectionUrl(hash: string, shortService: ShortService): Promise<URL | null> {
    let short: Short | null;
    try {
        short = await shortService.findByHash(hash);
    } catch (err: unknown) {
        throw Error(`failed to find a redirection url: ${err instanceof Error ? err : Error("unknown error")}`);
    }

    if (!short || isShortExpired(short) || !short.originalUrl) {
        return null;
    }

    return short.originalUrl;
}
