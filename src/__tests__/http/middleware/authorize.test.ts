import { describe, expect, it } from "@jest/globals";
import type { FastifyRequest } from "fastify";

import { authorize } from "../../../http/middleware/authorize.js";
import { ForbiddenError } from "../../../use-cases/errors/forbidden-error.js";

function createMockRequest(role: "PROFESSOR" | "ALUNO"): FastifyRequest {
  return {
    auth: { role },
  } as FastifyRequest;
}

describe("authorize", () => {
  it("deve permitir acesso quando o papel estiver na lista autorizada", async () => {
    const request = createMockRequest("PROFESSOR");
    const authorizeProfessor = authorize("PROFESSOR");

    await expect(authorizeProfessor(request)).resolves.toBeUndefined();
  });

  it("deve lançar ForbiddenError quando o papel não estiver autorizado", async () => {
    const request = createMockRequest("ALUNO");
    const authorizeProfessor = authorize("PROFESSOR");

    await expect(authorizeProfessor(request)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("deve permitir acesso para múltiplos papéis autorizados", async () => {
    const request = createMockRequest("ALUNO");
    const authorizeRead = authorize("PROFESSOR", "ALUNO");

    await expect(authorizeRead(request)).resolves.toBeUndefined();
  });
});
