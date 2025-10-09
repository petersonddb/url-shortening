import {Box, Button, Container, TextField, Typography} from "@mui/material";
import {type FormEvent, useState} from "react";
import {Message, type MessageContent} from "../messages/components.tsx";
import {useService} from "../services/hooks.tsx";
import {AuthServiceContext} from "./contexts.ts";
import {useNavigate} from "react-router";

/**
 * NewAuth authentication form for login
 */
export const NewAuth = () => {
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState<MessageContent | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const navigate = useNavigate();

    const authService = useService(AuthServiceContext);

    const errorHandler = (err: Error) => {
        setMessage({kind: "error", node: err.message});
        setError(err);

        console.error(err);
    };

    const successHandler = () => {
        setMessage({kind: "success", node: `user authenticated`});

        navigate("/home")?.catch((err: unknown) => {
            console.error(`failed to redirect user to home page after successfully login: ${err instanceof Error ? err : Error("unknown error")}`);
        });
    };

    const authenticate = (e: FormEvent) => {
        console.info(`authenticating user with email: ${email}`);

        setSubmitting(true);
        setError(undefined);

        if (e.cancelable) {
            e.preventDefault();
        }

        authService
            .authenticate({email, password})
            .then(successHandler)
            .catch(errorHandler)
            .finally(() => {
                setSubmitting(false);
            });
    };

    return (
        <Container id="new-authentication" maxWidth="xs"
                   sx={{height: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Box sx={{bgcolor: "grey.200", padding: 3, borderRadius: 5}}>
                <Typography variant="h5" align="center" gutterBottom={true}>Log into your account</Typography>

                <Box component="form" onSubmit={authenticate}>
                    <TextField
                        type="email"
                        label="Email"
                        value={email}
                        error={error != null}
                        helperText={"e.g. user@mail.com"}
                        autoComplete="email"
                        margin="normal"
                        fullWidth
                        required
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                    />

                    <TextField
                        type="password"
                        label="Password"
                        value={password}
                        error={error != null}
                        helperText={"the password you chose when creating your account"}
                        autoComplete="password"
                        margin="normal"
                        required
                        fullWidth
                        slotProps={{htmlInput: {"aria-label": "Password"}}}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />

                    <Button
                        variant="contained"
                        type="submit"
                        loading={submitting}
                        loadingPosition="start"
                        size="large"
                        sx={{marginY: 2}}
                        fullWidth
                        disabled={submitting}
                    >Authenticate</Button>
                </Box>
            </Box>

            <Message message={message} onClose={() => {
                setMessage(undefined)
            }}/>
        </Container>
    );
}
