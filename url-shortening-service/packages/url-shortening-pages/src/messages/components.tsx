import {Alert, AlertTitle, Slide, Snackbar} from "@mui/material";
import type {FC, ReactNode} from "react";

/**
 * MessageContent accept any React node, like children;
 * alongside the kind of message
 */
export type MessageContent = {
    kind: "success" | "error";
    node: ReactNode;
}

/**
 * MessageProps with optional content;
 * when content is undefined, the message doesn't show up
 */
export interface MessageProps {
    message?: MessageContent
    onClose: () => void;
}

/**
 * Message to float the screen briefly with some information
 * @param message content
 * @param onClose action
 */
export const Message: FC<MessageProps> = ({ message, onClose }) => {
    return (
        <Snackbar
            open={message != null}
            autoHideDuration={6 * 1000}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            slots={{ transition: Slide }}
            slotProps={{transition: {"direction": "left"}}}
            sx={{ minWidth: "500px" }}
            onClose={() => { onClose(); }}>

            <Alert
                severity={message?.kind}
                onClose={() => { onClose() }}
                sx={{ width: "100%", borderRadius: 5 }}>

                <AlertTitle>{message?.kind.toUpperCase()}</AlertTitle>
                {message?.node}
            </Alert>
        </Snackbar>
    )
}
