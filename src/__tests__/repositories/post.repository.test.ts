import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { mockPostRow } from "../mocks/post.mock.js";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../lib/pg/index.js", () => ({
  pool: {
    query: mockQuery,
  },
}));

const { PostRepository } = await import("../../repositories/pg/post.repository.js");

describe("PostRepository", () => {
  let repository: InstanceType<typeof PostRepository>;

  beforeEach(() => {
    repository = new PostRepository();
    mockQuery.mockReset();
  });

  it("deve listar posts com paginação", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [mockPostRow] })
      .mockResolvedValueOnce({ rows: [{ count: "1" }] });

    const result = await repository.findAll({ page: 1, limit: 10 });

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe(1);
    expect(result.total).toBe(1);
  });

  it("deve retornar post quando findById encontra registro", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockPostRow] });

    const result = await repository.findById(1);

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(result?.id).toBe(1);
    expect(result?.titulo).toBe("Post de teste");
  });

  it("deve retornar null quando findById não encontra registro", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await repository.findById(999);

    expect(result).toBeNull();
  });

  it("deve buscar posts por palavra-chave", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockPostRow] });

    const result = await repository.searchPosts("teste");

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["%teste%"]);
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe("Post de teste");
  });

  it("deve criar um post", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockPostRow] });

    const result = await repository.create({
      titulo: "Post de teste",
      conteudo: "Conteúdo de teste",
    });

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      "Post de teste",
      "Conteúdo de teste",
    ]);
    expect(result.id).toBe(1);
  });

  it("deve atualizar um post quando encontrado", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockPostRow] });

    const result = await repository.update(1, {
      titulo: "Post atualizado",
      conteudo: "Novo conteúdo",
    });

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      1,
      "Post atualizado",
      "Novo conteúdo",
    ]);
    expect(result?.id).toBe(1);
  });

  it("deve retornar null quando update não encontra registro", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await repository.update(999, {
      titulo: "Post atualizado",
      conteudo: "Novo conteúdo",
    });

    expect(result).toBeNull();
  });

  it("deve remover um post quando encontrado", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await repository.delete(1);

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(result).toBe(true);
  });

  it("deve retornar false quando delete não encontra registro", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await repository.delete(999);

    expect(result).toBe(false);
  });
});
