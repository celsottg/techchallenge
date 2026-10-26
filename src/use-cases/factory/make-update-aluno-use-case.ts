import { AlunoRepository } from "../../repositories/pg/aluno.repository.js";
import { UpdateAlunoUseCase } from "../update-aluno.use-case.js";

export function makeUpdateAlunoUseCase() {
  const alunoRepository = new AlunoRepository();

  return new UpdateAlunoUseCase(alunoRepository);
}
