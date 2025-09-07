import './App.css'
import {useState} from "react";
import {UserServiceContext} from "./users/contexts.ts";
import {type UserService} from "./users/users.ts";
import {NewUser} from "./users/components.tsx";
import {ApiUserService} from "./api/users.ts";
import {ApiAuthService} from "./api/authentications.ts";
import type {AuthService} from "./authentications/authentications.ts";
import {AuthServiceContext} from "./authentications/contexts.ts";
import {BrowserRouter, Route, Routes} from "react-router";
import {NewAuth} from "./authentications/components.tsx";

const API_BASE_URL: string = import.meta.env.VITE_API_URL as string;

function App() {
    const [userService] = useState<UserService>(new ApiUserService(API_BASE_URL));
    const [authService] = useState<AuthService>(new ApiAuthService(API_BASE_URL));

    return (
        <UserServiceContext value={userService}>
            <AuthServiceContext value={authService}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/signup" element={<NewUser/>}></Route>
                        <Route path="/login" element={<NewAuth/>}></Route>
                    </Routes>
                </BrowserRouter>
            </AuthServiceContext>
        </UserServiceContext>
    );
}

export default App;
