import { describe, expect, it, jest } from "@jest/globals";

import { SearchPostsUseCase } from "../../use-cases/search-posts.use-case.js";
import { createMockPostRepository, mockPost } from "../mocks/post.mock.js";

describe("SearchPostsUseCase", () => {
  it("deve buscar posts por palavra-chave via repositório", async () => {
    const postRepository = createMockPostRepository({
      searchPosts: jest.fn().mockResolvedValue([mockPost]),
    });
    const useCase = new SearchPostsUseCase(postRepository);

    const result = await useCase.execute({ search: "teste" });

    expect(postRepository.searchPosts).toHaveBeenCalledWith("teste");
    expect(result).toEqual({ posts: [mockPost] });
  });
});
