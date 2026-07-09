import type { FastifyRequest } from "fastify";

import type { Role } from "../../entities/models/auth.model.js";
import { ForbiddenError } from "../../use-cases/errors/forbidden-error.js";

export function authorize(...roles: Role[]) {
  return async function authorizeHandler(request: FastifyRequest): Promise<void> {
    if (!roles.includes(request.auth.role)) {
      throw new ForbiddenError();
    }
  };
}
