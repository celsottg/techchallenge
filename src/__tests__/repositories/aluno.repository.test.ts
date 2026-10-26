import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { mockAlunoRow } from "../mocks/aluno.mock.js";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../lib/pg/index.js", () => ({
  pool: {
    query: mockQuery,
  },
}));

const { AlunoRepository } =
  await import("../../repositories/pg/aluno.repository.js");

const ALUNO_FILTER = "descricao = 'ALUNO'";

describe("AlunoRepository", () => {
  let repository: InstanceType<typeof AlunoRepository>;

  beforeEach(() => {
    repository = new AlunoRepository();
    mockQuery.mockReset();
  });

  it("deve listar apenas alunos com paginação", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [mockAlunoRow] })
      .mockResolvedValueOnce({ rows: [{ count: "1" }] });

    const result = await repository.findAll({ page: 2, limit: 10 });

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[0][0]).toContain(ALUNO_FILTER);
    expect(mockQuery.mock.calls[0][1]).toEqual([10, 10]);
    expect(mockQuery.mock.calls[1][0]).toContain(ALUNO_FILTER);
    expect(result.alunos).toHaveLength(1);
    expect(result.alunos[0].id).toBe(1);
    expect(result.alunos[0]).not.toHaveProperty("senha");
    expect(result.total).toBe(1);
  });

  it("deve retornar aluno quando findById encontra registro", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockAlunoRow] });

    const result = await repository.findById(1);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(ALUNO_FILTER),
      [1],
    );
    expect(result?.id).toBe(1);
  });

  it("deve retornar null quando findById não encontra aluno", async () => {
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

  it("deve criar um aluno com o tipo ALUNO", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockAlunoRow] });

    const result = await repository.create({
      nome: "Ana Beatriz Silva",
      email: "ana.beatriz@aluno.fiap.br",
      senha: "senha-aluno-456",
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(ALUNO_FILTER),
      ["Ana Beatriz Silva", "ana.beatriz@aluno.fiap.br", "senha-aluno-456"],
    );
    expect(result.id).toBe(1);
  });

  it("deve atualizar um aluno mantendo a senha quando não informada", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockAlunoRow] });

    const result = await repository.update(1, {
      nome: "Ana Beatriz Silva",
      email: "ana.beatriz@aluno.fiap.br",
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(ALUNO_FILTER),
      [1, "Ana Beatriz Silva", "ana.beatriz@aluno.fiap.br", null],
    );
    expect(result?.id).toBe(1);
  });

  it("deve retornar null quando update não encontra aluno", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await repository.update(2, {
      nome: "a",
      email: "a@fiap.br",
      senha: "123456",
    });

    expect(result).toBeNull();
  });

  it("deve remover apenas alunos", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await repository.delete(1);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(ALUNO_FILTER),
      [1],
    );
    expect(result).toBe(true);
  });

  it("deve retornar false quando delete não encontra aluno", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await repository.delete(2);

    expect(result).toBe(false);
  });
});
