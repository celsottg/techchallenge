import { describe, expect, it, jest } from "@jest/globals";

import { UpdateProfessorUseCase } from "../../use-cases/update-professor.use-case.js";
import { EmailAlreadyInUseError } from "../../use-cases/errors/email-already-in-use-error.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import {
  createMockProfessorRepository,
  mockProfessor,
} from "../mocks/professor.mock.js";

describe("UpdateProfessorUseCase", () => {
  it("deve atualizar o professor quando encontrado", async () => {
    const updatedProfessor = { ...mockProfessor, nome: "Prof. Carlos" };
    const professorRepository = createMockProfessorRepository({
      findById: jest.fn().mockResolvedValue(mockProfessor),
      isEmailInUse: jest.fn().mockResolvedValue(false),
      update: jest.fn().mockResolvedValue(updatedProfessor),
    });
    const useCase = new UpdateProfessorUseCase(professorRepository);

    const result = await useCase.execute({
      id: 1,
      nome: "Prof. Carlos",
      email: mockProfessor.email,
    });

    expect(professorRepository.isEmailInUse).toHaveBeenCalledWith(
      mockProfessor.email,
      1,
    );
    expect(professorRepository.update).toHaveBeenCalledWith(1, {
      nome: "Prof. Carlos",
      email: mockProfessor.email,
    });
    expect(result).toEqual(updatedProfessor);
  });

  it("deve lançar ResourceNotFoundError quando professor não existe", async () => {
    const professorRepository = createMockProfessorRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const useCase = new UpdateProfessorUseCase(professorRepository);

    await expect(
      useCase.execute({ id: 999, nome: "a", email: "a@fiap.br" }),
    ).rejects.toThrow(ResourceNotFoundError);
    expect(professorRepository.update).not.toHaveBeenCalled();
  });

  it("deve lançar EmailAlreadyInUseError quando o email pertence a outro usuário", async () => {
    const professorRepository = createMockProfessorRepository({
      findById: jest.fn().mockResolvedValue(mockProfessor),
      isEmailInUse: jest.fn().mockResolvedValue(true),
    });
    const useCase = new UpdateProfessorUseCase(professorRepository);

    await expect(
      useCase.execute({
        id: 1,
        nome: "a",
        email: "ana.beatriz@aluno.fiap.br",
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
    expect(professorRepository.update).not.toHaveBeenCalled();
  });
});
