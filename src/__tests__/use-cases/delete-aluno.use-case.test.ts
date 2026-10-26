import { describe, expect, it, jest } from "@jest/globals";

import { DeleteAlunoUseCase } from "../../use-cases/delete-aluno.use-case.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import { createMockAlunoRepository } from "../mocks/aluno.mock.js";

describe("DeleteAlunoUseCase", () => {
  it("deve remover o aluno quando encontrado", async () => {
    const alunoRepository = createMockAlunoRepository({
      delete: jest.fn().mockResolvedValue(true),
    });
    const useCase = new DeleteAlunoUseCase(alunoRepository);

    await expect(useCase.execute(1)).resolves.toBeUndefined();
    expect(alunoRepository.delete).toHaveBeenCalledWith(1);
  });

  it("deve lançar ResourceNotFoundError quando aluno não existe", async () => {
    const alunoRepository = createMockAlunoRepository({
      delete: jest.fn().mockResolvedValue(false),
    });
    const useCase = new DeleteAlunoUseCase(alunoRepository);

    await expect(useCase.execute(999)).rejects.toThrow(ResourceNotFoundError);
  });
});
