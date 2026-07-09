import type { AuthContext } from "../../entities/models/auth.model.js";

declare module "fastify" {
  interface FastifyRequest {
    auth: AuthContext;
  }
}
