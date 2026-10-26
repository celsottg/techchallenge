import { describe, expect, it, jest } from "@jest/globals";

import { FindAlunoByIdUseCase } from "../../use-cases/find-aluno-by-id.use-case.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import { createMockAlunoRepository, mockAluno } from "../mocks/aluno.mock.js";

describe("FindAlunoByIdUseCase", () => {
  it("deve retornar o aluno quando encontrado", async () => {
    const alunoRepository = createMockAlunoRepository({
      findById: jest.fn().mockResolvedValue(mockAluno),
    });
    const useCase = new FindAlunoByIdUseCase(alunoRepository);

    const result = await useCase.execute(1);

    expect(alunoRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockAluno);
  });

  it("deve lançar ResourceNotFoundError quando aluno não existe", async () => {
    const alunoRepository = createMockAlunoRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const useCase = new FindAlunoByIdUseCase(alunoRepository);

    await expect(useCase.execute(999)).rejects.toThrow(ResourceNotFoundError);
  });
});
