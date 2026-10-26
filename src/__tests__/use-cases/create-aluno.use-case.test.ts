import { describe, expect, it, jest } from "@jest/globals";

import { CreateAlunoUseCase } from "../../use-cases/create-aluno.use-case.js";
import { EmailAlreadyInUseError } from "../../use-cases/errors/email-already-in-use-error.js";
import { createMockAlunoRepository, mockAluno } from "../mocks/aluno.mock.js";

const input = {
  nome: "Ana Beatriz Silva",
  email: "ana.beatriz@aluno.fiap.br",
  senha: "senha-aluno-456",
};

describe("CreateAlunoUseCase", () => {
  it("deve criar um aluno quando o email está livre", async () => {
    const alunoRepository = createMockAlunoRepository({
      isEmailInUse: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(mockAluno),
    });
    const useCase = new CreateAlunoUseCase(alunoRepository);

    const result = await useCase.execute(input);

    expect(alunoRepository.isEmailInUse).toHaveBeenCalledWith(input.email);
    expect(alunoRepository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockAluno);
  });

  it("deve lançar EmailAlreadyInUseError quando o email já existe", async () => {
    const alunoRepository = createMockAlunoRepository({
      isEmailInUse: jest.fn().mockResolvedValue(true),
    });
    const useCase = new CreateAlunoUseCase(alunoRepository);

    await expect(useCase.execute(input)).rejects.toThrow(
      EmailAlreadyInUseError,
    );
    expect(alunoRepository.create).not.toHaveBeenCalled();
  });
});
