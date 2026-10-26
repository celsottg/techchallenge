import type { IProfessorRepository } from "../repositories/professor.repository.interface.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

export class DeleteProfessorUseCase {
  constructor(private professorRepository: IProfessorRepository) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.professorRepository.delete(id);

    if (!deleted) {
      throw new ResourceNotFoundError();
    }
  }
}
