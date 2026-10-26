import { AlunoRepository } from "../../repositories/pg/aluno.repository.js";
import { DeleteAlunoUseCase } from "../delete-aluno.use-case.js";

export function makeDeleteAlunoUseCase() {
  const alunoRepository = new AlunoRepository();

  return new DeleteAlunoUseCase(alunoRepository);
}
