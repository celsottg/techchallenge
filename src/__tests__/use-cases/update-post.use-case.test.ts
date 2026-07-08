import { describe, expect, it, jest } from "@jest/globals";

import { UpdatePostUseCase } from "../../use-cases/update-post.use-case.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import { createMockPostRepository, mockPost } from "../mocks/post.mock.js";

describe("UpdatePostUseCase", () => {
  it("deve atualizar um post quando encontrado", async () => {
    const updatedPost = { ...mockPost, titulo: "Post atualizado" };
    const postRepository = createMockPostRepository({
      update: jest.fn().mockResolvedValue(updatedPost),
    });
    const useCase = new UpdatePostUseCase(postRepository);

    const result = await useCase.execute({
      id: 1,
      titulo: "Post atualizado",
      conteudo: "Conteúdo de teste",
    });

    expect(postRepository.update).toHaveBeenCalledWith(1, {
      titulo: "Post atualizado",
      conteudo: "Conteúdo de teste",
    });
    expect(result).toEqual(updatedPost);
  });

  it("deve lançar ResourceNotFoundError quando post não existe", async () => {
    const postRepository = createMockPostRepository({
      update: jest.fn().mockResolvedValue(null),
    });
    const useCase = new UpdatePostUseCase(postRepository);

    await expect(
      useCase.execute({ id: 999, titulo: "a", conteudo: "b" }),
    ).rejects.toThrow(ResourceNotFoundError);
  });
});
