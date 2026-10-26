import type {
  ICreateProfessor,
  IProfessor,
} from "../entities/models/professor.model.js";
import type { IProfessorRepository } from "../repositories/professor.repository.interface.js";
import { EmailAlreadyInUseError } from "./errors/email-already-in-use-error.js";

export class CreateProfessorUseCase {
  constructor(private professorRepository: IProfessorRepository) {}

  async execute(data: ICreateProfessor): Promise<IProfessor> {
    if (await this.professorRepository.isEmailInUse(data.email)) {
      throw new EmailAlreadyInUseError();
    }

    return this.professorRepository.create(data);
  }
}
