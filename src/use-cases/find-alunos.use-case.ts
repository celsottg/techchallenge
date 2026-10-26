import type {
  FindAllAlunosParams,
  FindAllAlunosResult,
  IAlunoRepository,
} from "../repositories/aluno.repository.interface.js";

export class FindAlunosUseCase {
  constructor(private alunoRepository: IAlunoRepository) {}

  async execute(params: FindAllAlunosParams): Promise<FindAllAlunosResult> {
    return this.alunoRepository.findAll(params);
  }
}
