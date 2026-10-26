import { jest } from "@jest/globals";

import type { IAluno } from "../../entities/models/aluno.model.js";
import type { IAlunoRepository } from "../../repositories/aluno.repository.interface.js";

export const mockAluno: IAluno = {
  id: 1,
  nome: "Ana Beatriz Silva",
  email: "ana.beatriz@aluno.fiap.br",
  data_criacao: new Date("2026-08-02T00:00:00.000Z"),
};

export const mockAlunoRow = {
  id: "1",
  nome: "Ana Beatriz Silva",
  email: "ana.beatriz@aluno.fiap.br",
  data_criacao: new Date("2026-08-02T00:00:00.000Z"),
};

export function createMockAlunoRepository(
  overrides: Partial<IAlunoRepository> = {},
): IAlunoRepository {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    isEmailInUse: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  };
}
