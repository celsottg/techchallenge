import { describe, expect, it, jest } from "@jest/globals";

import { CreateProfessorUseCase } from "../../use-cases/create-professor.use-case.js";
import { EmailAlreadyInUseError } from "../../use-cases/errors/email-already-in-use-error.js";
import {
  createMockProfessorRepository,
  mockProfessor,
} from "../mocks/professor.mock.js";

const input = {
  nome: "Dr. Carlos Mendes",
  email: "carlos.mendes@professor.fiap.br",
  senha: "senha-professor-123",
};

describe("CreateProfessorUseCase", () => {
  it("deve criar um professor quando o email está livre", async () => {
    const professorRepository = createMockProfessorRepository({
      isEmailInUse: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(mockProfessor),
    });
    const useCase = new CreateProfessorUseCase(professorRepository);

    const result = await useCase.execute(input);

    expect(professorRepository.isEmailInUse).toHaveBeenCalledWith(input.email);
    expect(professorRepository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockProfessor);
  });

  it("deve lançar EmailAlreadyInUseError quando o email já existe", async () => {
    const professorRepository = createMockProfessorRepository({
      isEmailInUse: jest.fn().mockResolvedValue(true),
    });
    const useCase = new CreateProfessorUseCase(professorRepository);

    await expect(useCase.execute(input)).rejects.toThrow(
      EmailAlreadyInUseError,
    );
    expect(professorRepository.create).not.toHaveBeenCalled();
  });
});
