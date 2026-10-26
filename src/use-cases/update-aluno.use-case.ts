import type { IAluno, IUpdateAluno } from "../entities/models/aluno.model.js";
import type { IAlunoRepository } from "../repositories/aluno.repository.interface.js";
import { EmailAlreadyInUseError } from "./errors/email-already-in-use-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface UpdateAlunoUseCaseRequest extends IUpdateAluno {
  id: number;
}

export class UpdateAlunoUseCase {
  constructor(private alunoRepository: IAlunoRepository) {}

  async execute({ id, ...data }: UpdateAlunoUseCaseRequest): Promise<IAluno> {
    const existing = await this.alunoRepository.findById(id);

    if (!existing) {
      throw new ResourceNotFoundError();
    }

    if (await this.alunoRepository.isEmailInUse(data.email, id)) {
      throw new EmailAlreadyInUseError();
    }

    const aluno = await this.alunoRepository.update(id, data);

    if (!aluno) {
      throw new ResourceNotFoundError();
    }

    return aluno;
  }
}
