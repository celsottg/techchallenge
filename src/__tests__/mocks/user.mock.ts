import { jest } from "@jest/globals";

import type {
  IUser,
  IUserType,
} from "../../entities/models/user.model.js";
import type { IUserRepository } from "../../repositories/user.repository.interface.js";

export const mockProfessorUser: IUser = {
  id: 1,
  nome: "Dr. Carlos Mendes",
  email: "carlos.mendes@professor.fiap.br",
  senha: "senha-professor-123",
  tipo_usuario_id: 1,
  data_criacao: new Date("2026-08-01T00:00:00.000Z"),
};

export const mockAlunoUser: IUser = {
  id: 2,
  nome: "Ana Beatriz Silva",
  email: "ana.beatriz@aluno.fiap.br",
  senha: "senha-aluno-456",
  tipo_usuario_id: 2,
  data_criacao: new Date("2026-08-02T00:00:00.000Z"),
};

export const mockProfessorUserType: IUserType = {
  id: 1,
  descricao: "PROFESSOR",
  token: "professor-dev-token-change-me",
};

export const mockAlunoUserType: IUserType = {
  id: 2,
  descricao: "ALUNO",
  token: "aluno-dev-token-change-me",
};

export function createMockUserRepository(
  overrides: Partial<IUserRepository> = {},
): IUserRepository {
  return {
    findByEmailAndPassword: jest.fn(),
    findUserTypeById: jest.fn(),
    ...overrides,
  };
}
