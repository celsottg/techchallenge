import type { IProfessor } from "../entities/models/professor.model.js";
import type { IProfessorRepository } from "../repositories/professor.repository.interface.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

export class FindProfessorByIdUseCase {
  constructor(private professorRepository: IProfessorRepository) {}

  async execute(id: number): Promise<IProfessor> {
    const professor = await this.professorRepository.findById(id);

    if (!professor) {
      throw new ResourceNotFoundError();
    }

    return professor;
  }
}
