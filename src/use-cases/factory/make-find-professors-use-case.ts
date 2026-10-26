import { ProfessorRepository } from "../../repositories/pg/professor.repository.js";
import { FindProfessorsUseCase } from "../find-professors.use-case.js";

export function makeFindProfessorsUseCase() {
  const professorRepository = new ProfessorRepository();

  return new FindProfessorsUseCase(professorRepository);
}
