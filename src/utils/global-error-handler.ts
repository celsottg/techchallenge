import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import { ForbiddenError } from "../use-cases/errors/forbidden-error.js";
import { ResourceNotFoundError } from "../use-cases/errors/resource-not-found-error.js";
import { UnauthorizedError } from "../use-cases/errors/unauthorized-error.js";

export function globalErrorHandler(
  error: Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: "Unauthorized",
    });
  }

  if (error instanceof ForbiddenError) {
    return reply.status(403).send({
      message: "Forbidden",
    });
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({
      message: "Resource not found",
    });
  }

  console.error(error);

  return reply.status(500).send({
    message: "Internal server error",
  });
}
