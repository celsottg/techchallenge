import { ProfessorRepository } from "../../repositories/pg/professor.repository.js";
import { UpdateProfessorUseCase } from "../update-professor.use-case.js";

export function makeUpdateProfessorUseCase() {
  const professorRepository = new ProfessorRepository();

  return new UpdateProfessorUseCase(professorRepository);
}
