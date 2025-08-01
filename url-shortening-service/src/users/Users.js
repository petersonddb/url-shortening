/**
 * User represents a user
 */
export class User {
  constructor(name = "", email = "", password = "") {
    this.id = null;

    this.name = name;
    this.email = email;
    this.password = password;
  }
}

/**
 * UserValidation results
 */
export class UserValidation {
  constructor() {
    this.name = [];
    this.email = [];
    this.password = [];
  }

  get valid() {
    return (
        this.name.length === 0 &&
        this.email.length === 0 &&
        this.password.length === 0
    );
  }
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRequiredSymbols = [/[a-zA-Z]+/, /[0-9]+/, /[!@#$%&*.,_=+]+/];

/**
 * validateUser corresponds to the expected values
 * @param user to be validated
 * @returns {UserValidation} with validation results
 */
export function validateUser(user) {
  const validation = new UserValidation();

  if (!(user.email && emailRegex.test(user.email))) {
    validation.email.push("Invalid email address");
  }

  if (!user.password || user.password.length < 8) {
    validation.password.push("Invalid password");
  } else {
    for (let symbolGroup of passwordRequiredSymbols) {
      if (!symbolGroup.test(user.password)) {
        validation.password.push("Invalid password");
      }
    }
  }

  return validation;
}
