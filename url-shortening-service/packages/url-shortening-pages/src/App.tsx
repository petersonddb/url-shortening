import './App.css'
import {useState} from "react";
import {UserServiceContext} from "./users/contexts.ts";
import {DummyUserService, type UserService} from "./users/users.ts";
import {NewUser} from "./users/components.tsx";

function App() {
  const [userService] = useState<UserService>(new DummyUserService());

  return(
    <UserServiceContext value={userService}>
        <NewUser />
    </UserServiceContext>
  );
}

export default App;
