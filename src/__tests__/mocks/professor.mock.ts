import { jest } from "@jest/globals";

import type { IProfessor } from "../../entities/models/professor.model.js";
import type { IProfessorRepository } from "../../repositories/professor.repository.interface.js";

export const mockProfessor: IProfessor = {
  id: 1,
  nome: "Dr. Carlos Mendes",
  email: "carlos.mendes@professor.fiap.br",
  data_criacao: new Date("2026-08-01T00:00:00.000Z"),
};

export const mockProfessorRow = {
  id: "1",
  nome: "Dr. Carlos Mendes",
  email: "carlos.mendes@professor.fiap.br",
  data_criacao: new Date("2026-08-01T00:00:00.000Z"),
};

export function createMockProfessorRepository(
  overrides: Partial<IProfessorRepository> = {},
): IProfessorRepository {
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
