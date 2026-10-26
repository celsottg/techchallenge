import "reflect-metadata";
import Fastify from "fastify";

import { authRoutes } from "./http/controllers/auth/routes.js";
import { postRoutes } from "./http/controllers/post/routes.js";
import { professorRoutes } from "./http/controllers/professor/routes.js";
import { globalErrorHandler } from "./utils/global-error-handler.js";

export const app = Fastify();

app.register(authRoutes);
app.register(postRoutes);
app.register(professorRoutes);
app.setErrorHandler(globalErrorHandler);
