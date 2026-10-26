import { Aluno } from "../../entities/aluno.js";
import type { IAluno } from "../../entities/models/aluno.model.js";
import type {
  FindAllAlunosParams,
  FindAllAlunosResult,
  IAlunoRepository,
} from "../aluno.repository.interface.js";
import { UserByRoleRepository } from "./user-by-role.repository.js";

export class AlunoRepository
  extends UserByRoleRepository<IAluno>
  implements IAlunoRepository
{
  constructor() {
    super(
      "ALUNO",
      (row) =>
        new Aluno({
          id: Number(row.id),
          nome: row.nome,
          email: row.email,
          data_criacao: row.data_criacao,
        }),
    );
  }

  async findAll({
    page,
    limit,
  }: FindAllAlunosParams): Promise<FindAllAlunosResult> {
    const { users, total } = await this.findAllByRole(page, limit);

    return { alunos: users, total };
  }
}
