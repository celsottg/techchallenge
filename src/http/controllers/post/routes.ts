import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { makeFindPostsUseCase } from "../../../use-cases/factory/make-find-posts-use-case.js";

const listPostsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
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
}
