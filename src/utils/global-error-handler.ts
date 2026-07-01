import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import { ResourceNotFoundError } from "../use-cases/errors/resource-not-found-error.js";

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
