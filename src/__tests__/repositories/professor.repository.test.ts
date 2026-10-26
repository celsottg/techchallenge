import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { mockProfessorRow } from "../mocks/professor.mock.js";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../lib/pg/index.js", () => ({
  pool: {
    query: mockQuery,
  },
}));

const { ProfessorRepository } = await import(
  "../../repositories/pg/professor.repository.js"
);

const PROFESSOR_FILTER = "descricao = 'PROFESSOR'";

describe("ProfessorRepository", () => {
  let repository: InstanceType<typeof ProfessorRepository>;

  beforeEach(() => {
    repository = new ProfessorRepository();
    mockQuery.mockReset();
  });

  it("deve listar apenas professores com paginação", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [mockProfessorRow] })
      .mockResolvedValueOnce({ rows: [{ count: "1" }] });

    const result = await repository.findAll({ page: 2, limit: 10 });

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[0][0]).toContain(PROFESSOR_FILTER);
    expect(mockQuery.mock.calls[0][1]).toEqual([10, 10]);
    expect(mockQuery.mock.calls[1][0]).toContain(PROFESSOR_FILTER);
    expect(result.professores).toHaveLength(1);
    expect(result.professores[0].id).toBe(1);
    expect(result.professores[0]).not.toHaveProperty("senha");
    expect(result.total).toBe(1);
  });

  it("deve retornar professor quando findById encontra registro", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockProfessorRow] });

    const result = await repository.findById(1);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(PROFESSOR_FILTER),
      [1],
    );
    expect(result?.id).toBe(1);
  });

  it("deve retornar null quando findById não encontra professor", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await repository.findById(2);

    expect(result).toBeNull();
  });

  it("deve indicar se o email já está em uso", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await repository.isEmailInUse("x@fiap.br");

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      "x@fiap.br",
      null,
    ]);
    expect(result).toBe(true);
  });

  it("deve ignorar o próprio usuário ao checar email", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await repository.isEmailInUse("x@fiap.br", 1);

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      "x@fiap.br",
      1,
    ]);
    expect(result).toBe(false);
  });

  it("deve criar um professor com o tipo PROFESSOR", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockProfessorRow] });

    const result = await repository.create({
      nome: "Dr. Carlos Mendes",
      email: "carlos.mendes@professor.fiap.br",
      senha: "senha-professor-123",
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(PROFESSOR_FILTER),
      [
        "Dr. Carlos Mendes",
        "carlos.mendes@professor.fiap.br",
        "senha-professor-123",
      ],
    );
    expect(result.id).toBe(1);
  });

  it("deve atualizar um professor mantendo a senha quando não informada", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockProfessorRow] });

    const result = await repository.update(1, {
      nome: "Dr. Carlos Mendes",
      email: "carlos.mendes@professor.fiap.br",
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(PROFESSOR_FILTER),
      [1, "Dr. Carlos Mendes", "carlos.mendes@professor.fiap.br", null],
    );
    expect(result?.id).toBe(1);
  });

  it("deve retornar null quando update não encontra professor", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await repository.update(2, {
      nome: "a",
      email: "a@fiap.br",
      senha: "123456",
    });

    expect(result).toBeNull();
  });

  it("deve remover apenas professores", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await repository.delete(1);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(PROFESSOR_FILTER),
      [1],
    );
    expect(result).toBe(true);
  });

  it("deve retornar false quando delete não encontra professor", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await repository.delete(2);

    expect(result).toBe(false);
  });
});
