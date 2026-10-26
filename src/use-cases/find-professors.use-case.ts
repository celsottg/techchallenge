import type {
  FindAllProfessorsParams,
  FindAllProfessorsResult,
  IProfessorRepository,
} from "../repositories/professor.repository.interface.js";

export class FindProfessorsUseCase {
  constructor(private professorRepository: IProfessorRepository) {}

  async execute(
    params: FindAllProfessorsParams,
  ): Promise<FindAllProfessorsResult> {
    return this.professorRepository.findAll(params);
  }
}
