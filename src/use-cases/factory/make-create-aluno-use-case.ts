import { AlunoRepository } from "../../repositories/pg/aluno.repository.js";
import { CreateAlunoUseCase } from "../create-aluno.use-case.js";

export function makeCreateAlunoUseCase() {
  const alunoRepository = new AlunoRepository();

  return new CreateAlunoUseCase(alunoRepository);
}
