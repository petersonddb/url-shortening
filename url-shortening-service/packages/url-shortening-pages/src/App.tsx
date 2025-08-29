import './App.css'
import {useState} from "react";
import {UserServiceContext} from "./users/contexts.ts";
import {type UserService} from "./users/users.ts";
import {NewUser} from "./users/components.tsx";
import {ApiUserService} from "./api/users.ts";

const API_BASE_URL: string = import.meta.env.VITE_API_URL as string;

function App() {
  const [userService] = useState<UserService>(new ApiUserService(API_BASE_URL));

  return(
    <UserServiceContext value={userService}>
        <NewUser />
    </UserServiceContext>
  );
}

export default App;
