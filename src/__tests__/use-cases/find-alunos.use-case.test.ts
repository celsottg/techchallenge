import { describe, expect, it, jest } from "@jest/globals";

import { FindAlunosUseCase } from "../../use-cases/find-alunos.use-case.js";
import { createMockAlunoRepository, mockAluno } from "../mocks/aluno.mock.js";

describe("FindAlunosUseCase", () => {
  it("deve retornar alunos paginados", async () => {
    const alunoRepository = createMockAlunoRepository({
      findAll: jest.fn().mockResolvedValue({ alunos: [mockAluno], total: 1 }),
    });
    const useCase = new FindAlunosUseCase(alunoRepository);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(alunoRepository.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(result).toEqual({ alunos: [mockAluno], total: 1 });
  });
});
