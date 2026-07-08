import { describe, expect, it, jest } from "@jest/globals";

import { CreatePostUseCase } from "../../use-cases/create-post.use-case.js";
import { createMockPostRepository, mockPost } from "../mocks/post.mock.js";

describe("CreatePostUseCase", () => {
  it("deve criar um post via repositório", async () => {
    const postRepository = createMockPostRepository({
      create: jest.fn().mockResolvedValue(mockPost),
    });
    const useCase = new CreatePostUseCase(postRepository);

    const result = await useCase.execute({
      titulo: "Post de teste",
      conteudo: "Conteúdo de teste",
    });

    expect(postRepository.create).toHaveBeenCalledWith({
      titulo: "Post de teste",
      conteudo: "Conteúdo de teste",
    });
    expect(result).toEqual(mockPost);
  });
});
