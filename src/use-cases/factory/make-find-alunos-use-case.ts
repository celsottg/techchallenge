import { AlunoRepository } from "../../repositories/pg/aluno.repository.js";
import { FindAlunosUseCase } from "../find-alunos.use-case.js";

export function makeFindAlunosUseCase() {
  const alunoRepository = new AlunoRepository();

  return new FindAlunosUseCase(alunoRepository);
}
