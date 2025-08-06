import express from 'express';
import {User, validateUser} from "../../users/Users.js";

const router = express.Router();

router.post("/", (req, res) => {
    const userParams = userPermittedParams(req.body);
    const user = new User(
      userParams.name, userParams.email, userParams.password);

    const validation = validateUser(user);
    if (!validation.valid) {
        res.status(400).json({ data: validation });

        return;
    }

    if (user.name === "") {
        user.name = user.email.split("@")[0];
    }

    // Fake store
    user.id = 111;

    res.json({ data: user });
});

export default router;

function userPermittedParams(body) {
    const { name, email, password } = body;

    return { name, email, password };
}
