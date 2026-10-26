import { describe, expect, it, jest } from "@jest/globals";

import { UpdateAlunoUseCase } from "../../use-cases/update-aluno.use-case.js";
import { EmailAlreadyInUseError } from "../../use-cases/errors/email-already-in-use-error.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import { createMockAlunoRepository, mockAluno } from "../mocks/aluno.mock.js";

describe("UpdateAlunoUseCase", () => {
  it("deve atualizar o aluno quando encontrado", async () => {
    const updatedAluno = { ...mockAluno, nome: "Ana B. Silva" };
    const alunoRepository = createMockAlunoRepository({
      findById: jest.fn().mockResolvedValue(mockAluno),
      isEmailInUse: jest.fn().mockResolvedValue(false),
      update: jest.fn().mockResolvedValue(updatedAluno),
    });
    const useCase = new UpdateAlunoUseCase(alunoRepository);

    const result = await useCase.execute({
      id: 1,
      nome: "Ana B. Silva",
      email: mockAluno.email,
    });

    expect(alunoRepository.isEmailInUse).toHaveBeenCalledWith(
      mockAluno.email,
      1,
    );
    expect(alunoRepository.update).toHaveBeenCalledWith(1, {
      nome: "Ana B. Silva",
      email: mockAluno.email,
    });
    expect(result).toEqual(updatedAluno);
  });

  it("deve lançar ResourceNotFoundError quando aluno não existe", async () => {
    const alunoRepository = createMockAlunoRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const useCase = new UpdateAlunoUseCase(alunoRepository);

    await expect(
      useCase.execute({ id: 999, nome: "a", email: "a@fiap.br" }),
    ).rejects.toThrow(ResourceNotFoundError);
    expect(alunoRepository.update).not.toHaveBeenCalled();
  });

  it("deve lançar EmailAlreadyInUseError quando o email pertence a outro usuário", async () => {
    const alunoRepository = createMockAlunoRepository({
      findById: jest.fn().mockResolvedValue(mockAluno),
      isEmailInUse: jest.fn().mockResolvedValue(true),
    });
    const useCase = new UpdateAlunoUseCase(alunoRepository);

    await expect(
      useCase.execute({
        id: 1,
        nome: "a",
        email: "carlos.mendes@professor.fiap.br",
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
    expect(alunoRepository.update).not.toHaveBeenCalled();
  });
});
