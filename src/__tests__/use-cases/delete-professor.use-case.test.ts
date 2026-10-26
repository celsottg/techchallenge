import { describe, expect, it, jest } from "@jest/globals";

import { DeleteProfessorUseCase } from "../../use-cases/delete-professor.use-case.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import { createMockProfessorRepository } from "../mocks/professor.mock.js";

describe("DeleteProfessorUseCase", () => {
  it("deve remover o professor quando encontrado", async () => {
    const professorRepository = createMockProfessorRepository({
      delete: jest.fn().mockResolvedValue(true),
    });
    const useCase = new DeleteProfessorUseCase(professorRepository);

    await expect(useCase.execute(1)).resolves.toBeUndefined();
    expect(professorRepository.delete).toHaveBeenCalledWith(1);
  });

  it("deve lançar ResourceNotFoundError quando professor não existe", async () => {
    const professorRepository = createMockProfessorRepository({
      delete: jest.fn().mockResolvedValue(false),
    });
    const useCase = new DeleteProfessorUseCase(professorRepository);

    await expect(useCase.execute(999)).rejects.toThrow(ResourceNotFoundError);
  });
});
