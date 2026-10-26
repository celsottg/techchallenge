import { ProfessorRepository } from "../../repositories/pg/professor.repository.js";
import { CreateProfessorUseCase } from "../create-professor.use-case.js";

export function makeCreateProfessorUseCase() {
  const professorRepository = new ProfessorRepository();

  return new CreateProfessorUseCase(professorRepository);
}
