import {User} from "../../users/Users.js";
import * as http from "node:http";

/**
 * UserService
 */
export class UserService {
  constructor() {}

  /**
   * create a new user in the server
   * @param user to be created
   */
  async create(user) {
    let res;

    try {
      res = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
    } catch(err) {
      throw { type: "others", error: `failed to send request to create user: ${err}` };
    }

    // success
    if (res.status >= 200 && res.status <= 299) {
      const userJson = (await res.json()).data;

      return new User(userJson.name, userJson.email, userJson.password);
    }

    // validation failure
    if (res.status >= 400 && res.status <= 499) {
      throw { type: "validation", error: (await res.json()).data };
    }

    // others
    throw { type: "others", error: `failed to create new user: ${http.STATUS_CODES[res.status]}` };
  }
}
