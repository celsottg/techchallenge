import { describe, expect, it, jest } from "@jest/globals";

import { LoginUseCase } from "../../use-cases/login.use-case.js";
import { UnauthorizedError } from "../../use-cases/errors/unauthorized-error.js";
import {
  createMockUserRepository,
  mockAlunoUser,
  mockAlunoUserType,
  mockProfessorUser,
  mockProfessorUserType,
} from "../mocks/user.mock.js";

describe("LoginUseCase", () => {
  it("deve autenticar professor e retornar token + role PROFESSOR + usuario", async () => {
    const userRepository = createMockUserRepository({
      findByEmailAndPassword: jest.fn().mockResolvedValue(mockProfessorUser),
      findUserTypeById: jest.fn().mockResolvedValue(mockProfessorUserType),
    });
    const useCase = new LoginUseCase(userRepository);

    const result = await useCase.execute({
      email: "carlos.mendes@professor.fiap.br",
      senha: "senha-professor-123",
    });

    expect(userRepository.findByEmailAndPassword).toHaveBeenCalledWith(
      "carlos.mendes@professor.fiap.br",
      "senha-professor-123",
    );
    expect(userRepository.findUserTypeById).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      token: "professor-dev-token-change-me",
      role: "PROFESSOR",
      usuario: {
        id: 1,
        nome: "Dr. Carlos Mendes",
        email: "carlos.mendes@professor.fiap.br",
      },
    });
  });

  it("deve autenticar aluno e retornar token + role ALUNO + usuario", async () => {
    const userRepository = createMockUserRepository({
      findByEmailAndPassword: jest.fn().mockResolvedValue(mockAlunoUser),
      findUserTypeById: jest.fn().mockResolvedValue(mockAlunoUserType),
    });
    const useCase = new LoginUseCase(userRepository);

    const result = await useCase.execute({
      email: "ana.beatriz@aluno.fiap.br",
      senha: "senha-aluno-456",
    });

    expect(result).toEqual({
      token: "aluno-dev-token-change-me",
      role: "ALUNO",
      usuario: {
        id: 2,
        nome: "Ana Beatriz Silva",
        email: "ana.beatriz@aluno.fiap.br",
      },
    });
  });

  it("deve lançar UnauthorizedError quando email não existe", async () => {
    const userRepository = createMockUserRepository({
      findByEmailAndPassword: jest.fn().mockResolvedValue(null),
    });
    const useCase = new LoginUseCase(userRepository);

    await expect(
      useCase.execute({
        email: "nao.existe@fiap.br",
        senha: "qualquer",
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("deve lançar UnauthorizedError quando senha está errada", async () => {
    const userRepository = createMockUserRepository({
      findByEmailAndPassword: jest.fn().mockResolvedValue(null),
    });
    const useCase = new LoginUseCase(userRepository);

    await expect(
      useCase.execute({
        email: "carlos.mendes@professor.fiap.br",
        senha: "senha-errada",
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("deve lançar UnauthorizedError quando user existe mas userType não é encontrado", async () => {
    const userRepository = createMockUserRepository({
      findByEmailAndPassword: jest.fn().mockResolvedValue(mockProfessorUser),
      findUserTypeById: jest.fn().mockResolvedValue(null),
    });
    const useCase = new LoginUseCase(userRepository);

    await expect(
      useCase.execute({
        email: "carlos.mendes@professor.fiap.br",
        senha: "senha-professor-123",
      }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
