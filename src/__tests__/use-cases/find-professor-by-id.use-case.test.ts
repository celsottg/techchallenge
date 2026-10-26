import { describe, expect, it, jest } from "@jest/globals";

import { FindProfessorByIdUseCase } from "../../use-cases/find-professor-by-id.use-case.js";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import {
  createMockProfessorRepository,
  mockProfessor,
} from "../mocks/professor.mock.js";

describe("FindProfessorByIdUseCase", () => {
  it("deve retornar o professor quando encontrado", async () => {
    const professorRepository = createMockProfessorRepository({
      findById: jest.fn().mockResolvedValue(mockProfessor),
    });
    const useCase = new FindProfessorByIdUseCase(professorRepository);

    const result = await useCase.execute(1);

    expect(professorRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockProfessor);
  });

  it("deve lançar ResourceNotFoundError quando professor não existe", async () => {
    const professorRepository = createMockProfessorRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const useCase = new FindProfessorByIdUseCase(professorRepository);

    await expect(useCase.execute(999)).rejects.toThrow(ResourceNotFoundError);
  });
});
