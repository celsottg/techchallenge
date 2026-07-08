import { jest } from "@jest/globals";

import type { IPost } from "../../entities/models/post.model.js";
import type { IPostRepository } from "../../repositories/post.repository.interface.js";

export const mockPost: IPost = {
  id: 1,
  titulo: "Post de teste",
  conteudo: "Conteúdo de teste",
  data_publicacao: new Date("2026-01-01T00:00:00.000Z"),
  data_atualizacao: new Date("2026-01-01T00:00:00.000Z"),
};

export const mockPostRow = {
  id: "1",
  titulo: "Post de teste",
  conteudo: "Conteúdo de teste",
  data_publicacao: new Date("2026-01-01T00:00:00.000Z"),
  data_atualizacao: new Date("2026-01-01T00:00:00.000Z"),
};

export function createMockPostRepository(
  overrides: Partial<IPostRepository> = {},
): IPostRepository {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    searchPosts: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  };
}
