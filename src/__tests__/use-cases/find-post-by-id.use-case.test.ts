import { describe, expect, it, jest } from "@jest/globals";

import { FindPostByIdUseCase } from "../../use-cases/find-post-by-id.use-case.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import { createMockPostRepository, mockPost } from "../mocks/post.mock.js";

describe("FindPostByIdUseCase", () => {
  it("deve retornar um post quando encontrado", async () => {
    const postRepository = createMockPostRepository({
      findById: jest.fn().mockResolvedValue(mockPost),
    });
    const useCase = new FindPostByIdUseCase(postRepository);

    const result = await useCase.execute(1);

    expect(postRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockPost);
  });

  it("deve lançar ResourceNotFoundError quando post não existe", async () => {
    const postRepository = createMockPostRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const useCase = new FindPostByIdUseCase(postRepository);

    await expect(useCase.execute(999)).rejects.toThrow(ResourceNotFoundError);
  });
});
