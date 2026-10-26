import { ProfessorRepository } from "../../repositories/pg/professor.repository.js";
import { DeleteProfessorUseCase } from "../delete-professor.use-case.js";

export function makeDeleteProfessorUseCase() {
  const professorRepository = new ProfessorRepository();

  return new DeleteProfessorUseCase(professorRepository);
}
