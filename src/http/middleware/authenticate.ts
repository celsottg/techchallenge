import { timingSafeEqual } from "node:crypto";

import type { FastifyRequest } from "fastify";

import type { Role } from "../../entities/models/auth.model.js";
import { env } from "../../env/index.js";
import { UnauthorizedError } from "../../use-cases/errors/unauthorized-error.js";

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

function resolveRoleFromToken(token: string): Role | null {
  if (safeCompare(token, env.PROFESSOR_ACCESS_TOKEN)) {
    return "PROFESSOR";
  }

  if (safeCompare(token, env.ALUNO_ACCESS_TOKEN)) {
    return "ALUNO";
  }

  return null;
}

export async function authenticate(request: FastifyRequest): Promise<void> {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new UnauthorizedError();
  }

  const role = resolveRoleFromToken(token);

  if (!role) {
    throw new UnauthorizedError();
  }

  request.auth = { role };
}
