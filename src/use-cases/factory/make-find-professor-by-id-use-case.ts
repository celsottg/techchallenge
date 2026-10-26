import { ProfessorRepository } from "../../repositories/pg/professor.repository.js";
import { FindProfessorByIdUseCase } from "../find-professor-by-id.use-case.js";

export function makeFindProfessorByIdUseCase() {
  const professorRepository = new ProfessorRepository();

  return new FindProfessorByIdUseCase(professorRepository);
}
