import express from "express";
import cors from "cors";
import path from "path";
import usersRouter from "./src/app/users/UsersController.js";

const app = express();
const port = 3000; // TODO: read from env vars

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:5173"],
}

const staticsDir = path.join(path.resolve(path.dirname(''), "dist"));
console.log(`Folder ${staticsDir} will be to serve static assets.`);
app.use(express.static(staticsDir));

// API
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/users", usersRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
