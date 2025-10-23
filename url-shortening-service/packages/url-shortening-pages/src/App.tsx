import './App.css'
import {useState} from "react";
import {UserServiceContext} from "./users/contexts.ts";
import {type UserService} from "./users/users.ts";
import {NewUser} from "./users/components.tsx";
import {ApiUserService} from "./api/users.ts";
import {ApiAuthService} from "./api/authentications.ts";
import type {AuthService} from "./authentications/authentications.ts";
import {AuthServiceContext} from "./authentications/contexts.ts";
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import {NewAuth} from "./authentications/components.tsx";
import {Home} from "./home/components.tsx";
import type {ShortService} from "./shorts/shorts.ts";
import {ShortServiceContext} from "./shorts/contexts.tsx";
import {ApiShortService} from "./api/shorts.ts";

const ApiBaseUrl: string = import.meta.env.VITE_API_URL as string;
const SettingsRequestUrl: string = import.meta.env.VITE_SETTINGS_REQUEST_URL as string;

function App() {
    const [userService] = useState<UserService>(new ApiUserService(ApiBaseUrl));
    const [authService] = useState<AuthService>(new ApiAuthService(ApiBaseUrl));
    const [shortService] = useState<ShortService>(new ApiShortService(ApiBaseUrl, authService));

    return (
        <UserServiceContext value={userService}>
            <AuthServiceContext value={authService}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/signup" element={<NewUser/>}/>
                        <Route path="/login" element={<NewAuth/>}/>

                        <Route
                            path="/home/*"
                            element={
                                <ShortServiceContext value={shortService}>
                                    <Home settingsRequestUrl={SettingsRequestUrl}/>
                                </ShortServiceContext>
                            }/>
                        
                        <Route path="*" element={<Navigate to="/home" replace/>}/> {/* redirect to a default path */}
                    </Routes>
                </BrowserRouter>
            </AuthServiceContext>
        </UserServiceContext>
    );
}

export default App;
