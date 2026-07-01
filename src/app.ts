import "reflect-metadata";
import Fastify from "fastify";

import { postRoutes } from "./http/controllers/post/routes.js";
import { globalErrorHandler } from "./utils/global-error-handler.js";

export const app = Fastify();

app.register(postRoutes);
app.setErrorHandler(globalErrorHandler);
