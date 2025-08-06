import {describe, beforeEach, it, expect} from "@jest/globals";
import {User, validateUser} from "./Users.js";

describe("given an User for validation", () => {
  describe("when a valid user", () => {
    let user;

    beforeEach(() => {
      user = new User("any", "any@email.com", "password1!");
    });

    it("it should be valid", () => {
      const validation = validateUser(user);

      expect(validation.valid).toBe(true);
    });
  })

  describe("when an invalid user", () => {
    let user;

    beforeEach(() => {
      user = new User();
    });

    it("should be invalid and provide proper messages for failed validations", () => {
      const validation = validateUser(user);

      expect(validation.valid).toBe(false);

      expect(validation.email.length).toBeGreaterThan(0);
      expect(validation.email[0]).toMatch(/invalid email/i);

      expect(validation.password.length).toBeGreaterThan(0);
      expect(validation.password[0]).toMatch(/invalid password/i);
    });
  });
});
