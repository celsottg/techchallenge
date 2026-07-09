import { describe, expect, it, jest } from "@jest/globals";
import type { FastifyRequest } from "fastify";

jest.unstable_mockModule("../../../env/index.js", () => ({
  env: {
    PROFESSOR_ACCESS_TOKEN: "professor-token",
    ALUNO_ACCESS_TOKEN: "aluno-token",
  },
}));

const { authenticate } = await import(
  "../../../http/middleware/authenticate.js"
);
const { UnauthorizedError } = await import(
  "../../../use-cases/errors/unauthorized-error.js"
);

function createMockRequest(authorization?: string): FastifyRequest {
  return {
    headers: authorization ? { authorization } : {},
  } as FastifyRequest;
}

describe("authenticate", () => {
  it("deve lançar UnauthorizedError quando o header Authorization estiver ausente", async () => {
    const request = createMockRequest();

    await expect(authenticate(request)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("deve lançar UnauthorizedError quando o header não usar Bearer", async () => {
    const request = createMockRequest("Basic professor-token");

    await expect(authenticate(request)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("deve lançar UnauthorizedError quando o token for inválido", async () => {
    const request = createMockRequest("Bearer token-invalido");

    await expect(authenticate(request)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("deve definir request.auth como PROFESSOR para token de professor", async () => {
    const request = createMockRequest("Bearer professor-token");

    await authenticate(request);

    expect(request.auth).toEqual({ role: "PROFESSOR" });
  });

  it("deve definir request.auth como ALUNO para token de aluno", async () => {
    const request = createMockRequest("Bearer aluno-token");

    await authenticate(request);

    expect(request.auth).toEqual({ role: "ALUNO" });
  });
});
