import {type Request, type Response} from "express";
import {getRedirectionUrl} from "../redirections/redirections.js";

/**
 * redirectShortLink to original URL
 * accordingly to data stored at the database
 */
export default function redirectShortLink(req: Request, res: Response) {
    if (!req.shortService) {
        throw new Error("failed to handle request: service not available");
    }

    getRedirectionUrl(req.params.hash ?? "", req.shortService).then((url) => {
        if (url) {
            res.redirect(url.toString());

            return;
        }

        res.status(404).send(serializeErrorPage("Redirection", Error("no valid url found for the given short link")));
    }).catch((err: unknown) => {
        res.status(500).send(serializeErrorPage(
            "Redirection", Error(`Something went wrong: ${err instanceof Error ? err : Error("unknown error")}`)));
    });
}

function serializeErrorPage(title: string, err: Error): string {
    return `${title}: ${err.message}`;
}
