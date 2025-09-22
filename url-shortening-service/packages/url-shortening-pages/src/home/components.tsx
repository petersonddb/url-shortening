import {
    Tabs,
    Tab,
    TableContainer,
    Table,
    TableRow,
    TableHead,
    TableCell,
    TableBody,
    Box,
    AppBar,
    Typography, Divider, Container, TextField, IconButton, Button, Skeleton
} from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {Link} from "react-router";
import {useRouteMatch} from "./hooks.tsx";
import {type FormEvent, type ReactNode, useEffect, useState} from "react";
import {useService} from "../services/hooks.tsx";
import {ShortServiceContext} from "../shorts/contexts.tsx";
import type {Short} from "../shorts/shorts.ts";
import {Message, type MessageContent} from "../messages/components.tsx";
import {ValidationErrors} from "../errors/errors.ts";

type Page = "/home" | "/home/settings";

interface TabPanelProps {
    id: string;
    children?: ReactNode;
    dir?: string;
    index: Page;
    value: Page;
}

const TabPanel = ({id, children, value, index, ...other}: TabPanelProps) => {
    return (
        <Box
            id={id}
            role="tabpanel"
            hidden={value !== index}
            aria-labelledby={`${id}-tab`}
            {...other}
        >
            {value === index && children}
        </Box>
    );
}


interface HeaderProps {
    currentTab: Page;
}

const Header = ({currentTab}: HeaderProps) => {
    return (
        <AppBar position="static" color="default"
                sx={{p: 1, pb: 0, borderBottom: "1px solid lightgrey", boxShadow: "none"}}>

            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <Typography variant="h6">user.name / home</Typography>

                <Link to="#"><LogoutIcon/></Link>
            </Box>

            <Tabs value={currentTab} textColor="inherit" aria-label="home screen views">
                <Tab id="shorts-view-tab"
                     icon={<LinkIcon/>}
                     iconPosition="start"
                     label="Shorts"
                     value="/home"
                     to="/home"
                     component={Link}
                     aria-controls="shorts-view"/>

                <Tab id="settings-view-tab"
                     icon={<SettingsIcon/>}
                     iconPosition="start"
                     label="Settings"
                     value="/home/settings"
                     to="/home/settings"
                     component={Link}
                     aria-controls="settings-view"/>
            </Tabs>
        </AppBar>
    );
};

type NewShortParams = {
    onCreated: (short: Short) => void;
    onFailed: (err: Error) => void;
};

const NewShort = ({onCreated, onFailed}: NewShortParams) => {
    const [generatingShort, setGeneratingShort] = useState(false);
    // TODO: Consider useReducer for the casting string/url
    const [originalUrl, setOriginalUrl] = useState<string>("");

    const [validationErrors, setValidationErrors] = useState<boolean>(false);

    const shortService = useService(ShortServiceContext);

    const successHandler = (short: Short) => {
        // TODO: use backend domain (baseUrl maybe)
        onCreated(short);
    }

    const errorHandler = (err: Error) => {
        let message: string;

        if (err instanceof ValidationErrors) {
            console.error(err.errors);

            message =
                `${err.message}: ${err.errors.map((e) => `${e.field}: ${e.messages.join(", ")}`).join("; ")}`;

            setValidationErrors(true);
        } else {
            console.error(err.message);

            message = err.message;
        }

        onFailed(new Error(message));
    }

    const generateShort = (event: FormEvent) => {
        console.log(`generating short url for ${originalUrl}`);

        if (event.cancelable) {
            event.preventDefault();
        }

        setGeneratingShort(true);
        setValidationErrors(false);

        const originalUrlObj = new URL(originalUrl);

        shortService.create({originalUrl: originalUrlObj})
            .then(successHandler)
            .catch(errorHandler)
            .finally(() => {
                setGeneratingShort(false)
            });

        setOriginalUrl("");
    };

    return (
        <Box component="form" onSubmit={generateShort}>
            <TextField
                type="url"
                size="small"
                variant="outlined"
                label="Long URL"
                value={originalUrl}
                error={validationErrors}
                autoComplete="off"
                required
                onChange={(e) => {
                    setOriginalUrl(e.target.value)
                }}/>

            <IconButton type="submit" loading={generatingShort} disabled={generatingShort}>
                <AddIcon/>
            </IconButton>
        </Box>
    );
};

type ShortListProps = {
    loading: boolean;
    error: boolean;
    items: Short[];
    onRetry: () => void;
}

const ShortsList = ({loading, error, items, onRetry}: ShortListProps) => {
    const errorRender = (
        <Box textAlign="center" sx={{p: 2}}>
            <LinkOffIcon fontSize="large"/>
            <Typography>Failed to load shorts!</Typography>

            <Button
                variant="contained"
                size="small"
                color="primary"
                sx={{mt: 2}}
                onClick={() => {
                    onRetry()
                }}>Try Again</Button>
        </Box>
    );

    const shortsRender = (
        <TableContainer>
            <Table size="small" sx={{borderRadius: 2}}>
                <TableHead sx={{bgcolor: "lightgrey"}}>
                    <TableRow>
                        <TableCell>Original URL</TableCell>
                        <TableCell>Short Link</TableCell>
                        <TableCell>Expiration</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((short) => (
                        <TableRow key={short.hash}>
                            <TableCell>{short.originalUrl.toString()}</TableCell>
                            <TableCell>{short.hash}</TableCell>
                            <TableCell>{short.expire.toLocaleString()}</TableCell>
                            <TableCell>-</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const noShortsRender = (
        <Box textAlign="center" sx={{p: 2}}>
            <CheckBoxOutlineBlankIcon fontSize="large"/>
            <Typography>No shorts generated yet!</Typography>
        </Box>
    );

    const loadRender = (
        <TableContainer>
            <Table size="small" sx={{borderRadius: 2}}>
                <TableHead sx={{bgcolor: "lightgrey"}}>
                    <TableRow>
                        <TableCell><Skeleton/></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(new Array(3)).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton/></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return loading ? loadRender : (error ? errorRender : (items.length === 0 ? noShortsRender : shortsRender));
};

type ShortsParams = {
    onMessage: (content: MessageContent) => void;
};

const Shorts = ({onMessage}: ShortsParams) => {
    const [shorts, setShorts] = useState<Short[]>([]);

    const [load, setLoad] = useState(true);
    const [error, setError] = useState(false);

    const shortService = useService(ShortServiceContext);

    const successHandler = (shorts: Short[]) => {
        setShorts([...shorts]);
    };

    const errorHandler = (err: Error) => {
        console.error(err.message);

        setError(true);
    };

    useEffect(() => {
        if (load) {
            setError(false);

            shortService
                .list()
                .then(successHandler)
                .catch(errorHandler)
                .finally(() => {
                    setLoad(false);
                });
        }
    }, [load, shortService]);

    return (
        <Box id="shorts">
            <Box sx={{m: 2, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <Typography variant="h6">Short Links</Typography>
                <NewShort
                    onCreated={(short) => {
                        onMessage({kind: "success", node: `Short link generated: ${short.hash}`});

                        setLoad(true);
                    }}
                    onFailed={(err) => {
                        onMessage({kind: "error", node: err.message});
                    }}/>
            </Box>

            <Divider/>

            <Box sx={{m: 2, borderRadius: 2, border: "1px solid lightgrey"}}>
                <ShortsList
                    loading={load}
                    error={error}
                    items={shorts}
                    onRetry={() => {
                        setLoad(true)
                    }}/>
            </Box>
        </Box>
    );
}

interface SettingsProps {
    settingsRequestUrl: string;
}

const Settings = ({settingsRequestUrl}: SettingsProps) => {
    return (
        <Box id="settings">
            <Box sx={{m: 2}}>
                <Typography variant="h6">Settings</Typography>
            </Box>

            <Divider/>

            <Box sx={{m: 2, p: 2, textAlign: "center", border: "1px solid lightgrey", borderRadius: 2}}>
                <Typography variant="body1">
                    open an issue into <Link to={settingsRequestUrl} target="_blank">our ticketing system</Link>
                </Typography>
            </Box>
        </Box>
    )
}

export type HomeProps = SettingsProps;

/**
 * Home for logged-in user
 * @param HomeProps
 */
export const Home = ({settingsRequestUrl}: HomeProps) => {
    const routeMatch = useRouteMatch(["/home", "/home/settings"]);
    const currentTab = (routeMatch?.pattern.path ?? "/home") as Page;

    const [message, setMessage] = useState<MessageContent | undefined>();

    return (
        <Container id="home" disableGutters maxWidth={false}>
            <Header currentTab={currentTab}/>

            <TabPanel id="shorts-view" value={currentTab} index="/home"><Shorts onMessage={setMessage}/></TabPanel>
            <TabPanel id="settings-view" value={currentTab} index="/home/settings">
                <Settings settingsRequestUrl={settingsRequestUrl}/>
            </TabPanel>

            <Message message={message} onClose={() => {
                setMessage(undefined)
            }}/>
        </Container>
    );
};
