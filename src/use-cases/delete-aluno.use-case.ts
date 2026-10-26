import type { IAlunoRepository } from "../repositories/aluno.repository.interface.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

export class DeleteAlunoUseCase {
  constructor(private alunoRepository: IAlunoRepository) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.alunoRepository.delete(id);

    if (!deleted) {
      throw new ResourceNotFoundError();
    }
  }
}
