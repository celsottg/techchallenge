import type { ICreateAluno, IAluno } from "../entities/models/aluno.model.js";
import type { IAlunoRepository } from "../repositories/aluno.repository.interface.js";
import { EmailAlreadyInUseError } from "./errors/email-already-in-use-error.js";

export class CreateAlunoUseCase {
  constructor(private alunoRepository: IAlunoRepository) {}

  async execute(data: ICreateAluno): Promise<IAluno> {
    if (await this.alunoRepository.isEmailInUse(data.email)) {
      throw new EmailAlreadyInUseError();
    }

    return this.alunoRepository.create(data);
  }
}
