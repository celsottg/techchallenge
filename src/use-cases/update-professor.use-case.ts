import type {
  IProfessor,
  IUpdateProfessor,
} from "../entities/models/professor.model.js";
import type { IProfessorRepository } from "../repositories/professor.repository.interface.js";
import { EmailAlreadyInUseError } from "./errors/email-already-in-use-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface UpdateProfessorUseCaseRequest extends IUpdateProfessor {
  id: number;
}

export class UpdateProfessorUseCase {
  constructor(private professorRepository: IProfessorRepository) {}

  async execute({
    id,
    ...data
  }: UpdateProfessorUseCaseRequest): Promise<IProfessor> {
    const existing = await this.professorRepository.findById(id);

    if (!existing) {
      throw new ResourceNotFoundError();
    }

    if (await this.professorRepository.isEmailInUse(data.email, id)) {
      throw new EmailAlreadyInUseError();
    }

    const professor = await this.professorRepository.update(id, data);

    if (!professor) {
      throw new ResourceNotFoundError();
    }

    return professor;
  }
}
