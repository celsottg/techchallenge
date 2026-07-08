import { describe, expect, it, jest } from "@jest/globals";

import { DeletePostUseCase } from "../../use-cases/delete-post.use-case.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import { createMockPostRepository } from "../mocks/post.mock.js";

describe("DeletePostUseCase", () => {
  it("deve remover um post quando encontrado", async () => {
    const postRepository = createMockPostRepository({
      delete: jest.fn().mockResolvedValue(true),
    });
    const useCase = new DeletePostUseCase(postRepository);

    await useCase.execute(1);

    expect(postRepository.delete).toHaveBeenCalledWith(1);
  });

  it("deve lançar ResourceNotFoundError quando post não existe", async () => {
    const postRepository = createMockPostRepository({
      delete: jest.fn().mockResolvedValue(false),
    });
    const useCase = new DeletePostUseCase(postRepository);

    await expect(useCase.execute(999)).rejects.toThrow(ResourceNotFoundError);
  });
});
