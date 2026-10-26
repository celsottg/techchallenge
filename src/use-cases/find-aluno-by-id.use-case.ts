import type { IAluno } from "../entities/models/aluno.model.js";
import type { IAlunoRepository } from "../repositories/aluno.repository.interface.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

export class FindAlunoByIdUseCase {
  constructor(private alunoRepository: IAlunoRepository) {}

  async execute(id: number): Promise<IAluno> {
    const aluno = await this.alunoRepository.findById(id);

    if (!aluno) {
      throw new ResourceNotFoundError();
    }

    return aluno;
  }
}
