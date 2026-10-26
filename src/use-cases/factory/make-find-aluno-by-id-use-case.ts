import { AlunoRepository } from "../../repositories/pg/aluno.repository.js";
import { FindAlunoByIdUseCase } from "../find-aluno-by-id.use-case.js";

export function makeFindAlunoByIdUseCase() {
  const alunoRepository = new AlunoRepository();

  return new FindAlunoByIdUseCase(alunoRepository);
}
