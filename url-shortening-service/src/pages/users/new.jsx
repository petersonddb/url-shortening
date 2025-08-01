import {useContext, useState} from "react";
import {UserServiceContext} from "./Contexts.js";
import {User} from "../../users/Users.js";

export default function NewUser() {
  const userService = useContext(UserServiceContext);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitForm = (e) => {
    e.preventDefault();

    setCreating(true);
    setError(null);
    setValidationError(null);

    const user = new User("", email, password);

    userService.create(user)
      .then((user) => {
        console.log(`User created: ${user}, should redirect to login page!`);
      })
      .catch((err) => {
        switch (err.type) {
          case "validation":
            setValidationError(err.error);
            break;
          default:
            setError(err.error);
        }
      })
      .finally(() => {
        setCreating(false);
      });
  };

  return (
    <div id="new-user">
      <h1>Create your account:</h1>

      <form onSubmit={submitForm}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {validationError && validationError.email && <label htmlFor="email">{validationError.email}</label>}

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {validationError && validationError.password && <label htmlFor="password">{validationError.password}</label>}

        <button type="submit" id="create" value="Create Account" disabled={creating}>Create Account</button>
        <label htmlFor="create">{creating && "creating..."}</label>
      </form>

      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
