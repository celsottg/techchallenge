import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { makeCreateProfessorUseCase } from "../../../use-cases/factory/make-create-professor-use-case.js";
import { makeDeleteProfessorUseCase } from "../../../use-cases/factory/make-delete-professor-use-case.js";
import { makeFindProfessorByIdUseCase } from "../../../use-cases/factory/make-find-professor-by-id-use-case.js";
import { makeFindProfessorsUseCase } from "../../../use-cases/factory/make-find-professors-use-case.js";
import { makeUpdateProfessorUseCase } from "../../../use-cases/factory/make-update-professor-use-case.js";

const listProfessorsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const createProfessorBodySchema = z.object({
  nome: z.string().min(1).max(255),
  email: z.email().max(255),
  senha: z.string().min(6).max(255),
});

const updateProfessorBodySchema = createProfessorBodySchema.extend({
  senha: createProfessorBodySchema.shape.senha.optional(),
});

const professorParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const professorAccess = {
  preHandler: [authenticate, authorize("PROFESSOR")],
};

export async function professorRoutes(app: FastifyInstance) {
  app.get("/professores", professorAccess, async (request, reply) => {
    const { page, limit } = listProfessorsQuerySchema.parse(request.query);

    const findProfessorsUseCase = makeFindProfessorsUseCase();
    const { professores, total } = await findProfessorsUseCase.execute({
      page,
      limit,
    });

    return reply.status(200).send({
      professores,
      page,
      limit,
      total,
    });
  });

  app.get("/professores/:id", professorAccess, async (request, reply) => {
    const { id } = professorParamsSchema.parse(request.params);

    const findProfessorByIdUseCase = makeFindProfessorByIdUseCase();
    const professor = await findProfessorByIdUseCase.execute(id);

    return reply.status(200).send(professor);
  });

  app.post("/professores", professorAccess, async (request, reply) => {
    const body = createProfessorBodySchema.parse(request.body);

    const createProfessorUseCase = makeCreateProfessorUseCase();
    const professor = await createProfessorUseCase.execute(body);

    return reply.status(201).send(professor);
  });

  app.put("/professores/:id", professorAccess, async (request, reply) => {
    const { id } = professorParamsSchema.parse(request.params);
    const body = updateProfessorBodySchema.parse(request.body);

    const updateProfessorUseCase = makeUpdateProfessorUseCase();
    const professor = await updateProfessorUseCase.execute({ id, ...body });

    return reply.status(200).send(professor);
  });

  app.delete("/professores/:id", professorAccess, async (request, reply) => {
    const { id } = professorParamsSchema.parse(request.params);

    const deleteProfessorUseCase = makeDeleteProfessorUseCase();
    await deleteProfessorUseCase.execute(id);

    return reply.status(204).send();
  });
}
