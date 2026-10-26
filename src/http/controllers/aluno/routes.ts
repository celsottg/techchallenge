import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { makeCreateAlunoUseCase } from "../../../use-cases/factory/make-create-aluno-use-case.js";
import { makeDeleteAlunoUseCase } from "../../../use-cases/factory/make-delete-aluno-use-case.js";
import { makeFindAlunoByIdUseCase } from "../../../use-cases/factory/make-find-aluno-by-id-use-case.js";
import { makeFindAlunosUseCase } from "../../../use-cases/factory/make-find-alunos-use-case.js";
import { makeUpdateAlunoUseCase } from "../../../use-cases/factory/make-update-aluno-use-case.js";

const listAlunosQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const createAlunoBodySchema = z.object({
  nome: z.string().min(1).max(255),
  email: z.email().max(255),
  senha: z.string().min(6).max(255),
});

const updateAlunoBodySchema = createAlunoBodySchema.extend({
  senha: createAlunoBodySchema.shape.senha.optional(),
});

const alunoParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const professorAccess = {
  preHandler: [authenticate, authorize("PROFESSOR")],
};

export async function alunoRoutes(app: FastifyInstance) {
  app.get("/alunos", professorAccess, async (request, reply) => {
    const { page, limit } = listAlunosQuerySchema.parse(request.query);

    const findAlunosUseCase = makeFindAlunosUseCase();
    const { alunos, total } = await findAlunosUseCase.execute({
      page,
      limit,
    });

    return reply.status(200).send({
      alunos,
      page,
      limit,
      total,
    });
  });

  app.get("/alunos/:id", professorAccess, async (request, reply) => {
    const { id } = alunoParamsSchema.parse(request.params);

    const findAlunoByIdUseCase = makeFindAlunoByIdUseCase();
    const aluno = await findAlunoByIdUseCase.execute(id);

    return reply.status(200).send(aluno);
  });

  app.post("/alunos", professorAccess, async (request, reply) => {
    const body = createAlunoBodySchema.parse(request.body);

    const createAlunoUseCase = makeCreateAlunoUseCase();
    const aluno = await createAlunoUseCase.execute(body);

    return reply.status(201).send(aluno);
  });

  app.put("/alunos/:id", professorAccess, async (request, reply) => {
    const { id } = alunoParamsSchema.parse(request.params);
    const body = updateAlunoBodySchema.parse(request.body);

    const updateAlunoUseCase = makeUpdateAlunoUseCase();
    const aluno = await updateAlunoUseCase.execute({ id, ...body });

    return reply.status(200).send(aluno);
  });

  app.delete("/alunos/:id", professorAccess, async (request, reply) => {
    const { id } = alunoParamsSchema.parse(request.params);

    const deleteAlunoUseCase = makeDeleteAlunoUseCase();
    await deleteAlunoUseCase.execute(id);

    return reply.status(204).send();
  });
}
