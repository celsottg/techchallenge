import { Professor } from "../../entities/professor.js";
import type { IProfessor } from "../../entities/models/professor.model.js";
import type {
  FindAllProfessorsParams,
  FindAllProfessorsResult,
  IProfessorRepository,
} from "../professor.repository.interface.js";
import { UserByRoleRepository } from "./user-by-role.repository.js";

export class ProfessorRepository
  extends UserByRoleRepository<IProfessor>
  implements IProfessorRepository
{
  constructor() {
    super(
      "PROFESSOR",
      (row) =>
        new Professor({
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
  }: FindAllProfessorsParams): Promise<FindAllProfessorsResult> {
    const { users, total } = await this.findAllByRole(page, limit);

    return { professores: users, total };
  }
}
