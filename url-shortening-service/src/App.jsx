import './App.css'
import NewUser from "/src/pages/users/new.jsx";
import {UserServiceContext} from "/src/pages/users/Contexts.js";
import {UserService} from "/src/pages/users/UserService.js";

function App() {
  return (
    <UserServiceContext value={new UserService()}>
      <NewUser></NewUser>
    </UserServiceContext>
  );
}

export default App
