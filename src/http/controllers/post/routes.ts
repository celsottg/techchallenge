import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { makeCreatePostUseCase } from "../../../use-cases/factory/make-create-post-use-case.js";
import { makeDeletePostUseCase } from "../../../use-cases/factory/make-delete-post-use-case.js";
import { makeFindPostsUseCase } from "../../../use-cases/factory/make-find-posts-use-case.js";
import { makeUpdatePostUseCase } from "../../../use-cases/factory/make-update-post-use-case.js";

const listPostsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const createPostBodySchema = z.object({
  titulo: z.string().min(1).max(255),
  conteudo: z.string().min(1),
});

const postParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function postRoutes(app: FastifyInstance) {
  app.get("/posts", async (request, reply) => {
    const { page, limit } = listPostsQuerySchema.parse(request.query);

    const findPostsUseCase = makeFindPostsUseCase();
    const { posts, total } = await findPostsUseCase.execute({ page, limit });

    return reply.status(200).send({
      posts,
      page,
      limit,
      total,
    });
  });

  app.post("/posts", async (request, reply) => {
    const body = createPostBodySchema.parse(request.body);

    const createPostUseCase = makeCreatePostUseCase();
    const post = await createPostUseCase.execute(body);

    return reply.status(201).send(post);
  });

  app.put("/posts/:id", async (request, reply) => {
    const { id } = postParamsSchema.parse(request.params);
    const body = createPostBodySchema.parse(request.body);

    const updatePostUseCase = makeUpdatePostUseCase();
    const post = await updatePostUseCase.execute({ id, ...body });

    return reply.status(200).send(post);
  });

  app.delete("/posts/:id", async (request, reply) => {
    const { id } = postParamsSchema.parse(request.params);

    const deletePostUseCase = makeDeletePostUseCase();
    await deletePostUseCase.execute(id);

    return reply.status(204).send();
  });
}
