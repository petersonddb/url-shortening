import {type FormEvent, useState} from "react";
import {
    Box,
    Button,
    Container,
    Typography,
    TextField,
} from "@mui/material";
import {type User} from "./users.ts";
import {type MessageContent, Message} from "../messages/components.tsx"
import {ValidationErrors} from "../errors/errors.ts";
import {useService} from "../services/hooks.tsx";
import {UserServiceContext} from "./contexts.ts";

/**
 * NewUser sign-up form
 */
export const NewUser = () => {
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState<MessageContent | undefined>();
    const [validationErrors, setValidationErrors] = useState<ValidationErrors | undefined>();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const userService = useService(UserServiceContext);

    const errorHandler = (err: Error) => {
        setMessage({kind: "error", node: err.message});

        if (err instanceof ValidationErrors) {
            console.error(err.errors);

            setValidationErrors(err);
        } else {
            console.error(err.message);
        }
    }

    const successHandler = (user: User) => {
        setMessage({kind: "success", node: `User created ${user.name}`});
    }

    const submitUser = (e: FormEvent) => {
        console.info(`submitting new user with email: ${email}`);

        setSubmitting(true);
        setValidationErrors(undefined);

        if (e.cancelable) {
            e.preventDefault();
        }

        userService
            .create({email, password})
            .then(successHandler)
            .catch(errorHandler)
            .finally(() => {
                setSubmitting(false);
            });
    }

    const errorsForField = (field: string) =>
        validationErrors?.errors.find((e) => e.field === field)?.messages.join(", ");

    const emailErrors = errorsForField("email");
    const passwordErrors = errorsForField("password");

    return (
        <Container id="new-user" maxWidth="xs"
                   sx={{height: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Box sx={{bgcolor: "grey.200", padding: 3, borderRadius: 5}}>
                <Typography variant="h5" align="center" gutterBottom={true}>Create an Account</Typography>

                <Box component="form" onSubmit={submitUser}>
                    <TextField
                        type="email"
                        label="Email"
                        value={email}
                        error={emailErrors != null}
                        helperText={emailErrors || "user@email.com"}
                        autoComplete="email"
                        margin="normal"
                        fullWidth
                        required
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}/>

                    <TextField
                        type="password"
                        label="Password"
                        value={password}
                        error={passwordErrors != null}
                        helperText={passwordErrors || "at least 8-digit, a-z, A-Z, 0-9, !@#$%&*.,_=+"}
                        autoComplete="new-password"
                        margin="normal"
                        required
                        fullWidth
                        slotProps={{htmlInput: {"aria-label": "Password"}}} // Acceptable because input purpose is obvious
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}/>

                    <Button
                        variant="contained"
                        type="submit"
                        loading={submitting}
                        loadingPosition="start"
                        size="large"
                        sx={{marginY: 2}}
                        fullWidth
                        disabled={submitting}>Submit</Button>
                </Box>
            </Box>

            <Message message={message} onClose={() => {
                setMessage(undefined)
            }}/>
        </Container>
    );
}
