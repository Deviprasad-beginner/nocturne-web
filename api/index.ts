import express from "express";
import serverless from "serverless-http";
import { registerApiRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

await registerApiRoutes(app);

export default serverless(app);
