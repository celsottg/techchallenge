import { describe, expect, it, jest } from "@jest/globals";

import { FindPostsUseCase } from "../../use-cases/find-posts.use-case.js";
import { createMockPostRepository, mockPost } from "../mocks/post.mock.js";

describe("FindPostsUseCase", () => {
  it("deve listar posts com paginação via repositório", async () => {
    const paginatedResult = {
      posts: [mockPost],
      total: 1,
    };
    const postRepository = createMockPostRepository({
      findAll: jest.fn().mockResolvedValue(paginatedResult),
    });
    const useCase = new FindPostsUseCase(postRepository);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(postRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result).toEqual(paginatedResult);
  });
});
