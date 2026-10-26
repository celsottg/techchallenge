import { describe, expect, it, jest } from "@jest/globals";

import { FindProfessorsUseCase } from "../../use-cases/find-professors.use-case.js";
import {
  createMockProfessorRepository,
  mockProfessor,
} from "../mocks/professor.mock.js";

describe("FindProfessorsUseCase", () => {
  it("deve retornar professores paginados", async () => {
    const professorRepository = createMockProfessorRepository({
      findAll: jest
        .fn()
        .mockResolvedValue({ professores: [mockProfessor], total: 1 }),
    });
    const useCase = new FindProfessorsUseCase(professorRepository);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(professorRepository.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(result).toEqual({ professores: [mockProfessor], total: 1 });
  });
});
