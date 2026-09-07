import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { makeLoginUseCase } from "../../../use-cases/factory/make-login-use-case.js";

const loginBodySchema = z.object({
  email: z.string().min(1),
  senha: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const { email, senha } = loginBodySchema.parse(request.body);

    const loginUseCase = makeLoginUseCase();
    const result = await loginUseCase.execute({ email, senha });

    return reply.status(200).send(result);
  });
}
