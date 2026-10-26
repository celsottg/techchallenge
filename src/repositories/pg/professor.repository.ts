import { Professor } from "../../entities/professor.js";
import type {
  ICreateProfessor,
  IUpdateProfessor,
} from "../../entities/models/professor.model.js";
import type {
  FindAllProfessorsParams,
  FindAllProfessorsResult,
  IProfessorRepository,
} from "../professor.repository.interface.js";
import { pool } from "../../lib/pg/index.js";

interface ProfessorRow {
  id: string;
  nome: string;
  email: string;
  data_criacao: Date;
}

// Professores são usuários de techchallenge_user cujo tipo é PROFESSOR;
// todas as queries filtram por esse tipo para nunca tocar em alunos.
const PROFESSOR_TYPE_ID_SQL = `(SELECT id FROM techchallenge_usertype WHERE descricao = 'PROFESSOR')`;

function toProfessor(row: ProfessorRow) {
  return new Professor({
    id: Number(row.id),
    nome: row.nome,
    email: row.email,
    data_criacao: row.data_criacao,
  });
}

export class ProfessorRepository implements IProfessorRepository {
  async findAll({
    page,
    limit,
  }: FindAllProfessorsParams): Promise<FindAllProfessorsResult> {
    const offset = (page - 1) * limit;

    const [professoresResult, countResult] = await Promise.all([
      pool.query<ProfessorRow>(
        `SELECT id, nome, email, data_criacao
         FROM techchallenge_user
         WHERE tipo_usuario_id = ${PROFESSOR_TYPE_ID_SQL}
         ORDER BY nome ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM techchallenge_user
         WHERE tipo_usuario_id = ${PROFESSOR_TYPE_ID_SQL}`,
      ),
    ]);

    return {
      professores: professoresResult.rows.map(toProfessor),
      total: Number(countResult.rows[0]?.count ?? 0),
    };
  }

  async findById(id: number) {
    const result = await pool.query<ProfessorRow>(
      `SELECT id, nome, email, data_criacao
       FROM techchallenge_user
       WHERE id = $1 AND tipo_usuario_id = ${PROFESSOR_TYPE_ID_SQL}`,
      [id],
    );

    const row = result.rows[0];

    return row ? toProfessor(row) : null;
  }

  async isEmailInUse(email: string, ignoreUserId?: number): Promise<boolean> {
    // O email é único em techchallenge_user inteira (professores e alunos).
    const result = await pool.query(
      `SELECT 1
       FROM techchallenge_user
       WHERE email = $1 AND ($2::bigint IS NULL OR id <> $2)
       LIMIT 1`,
      [email, ignoreUserId ?? null],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async create({ nome, email, senha }: ICreateProfessor) {
    const result = await pool.query<ProfessorRow>(
      `INSERT INTO techchallenge_user (nome, email, senha, tipo_usuario_id)
       VALUES ($1, $2, $3, ${PROFESSOR_TYPE_ID_SQL})
       RETURNING id, nome, email, data_criacao`,
      [nome, email, senha],
    );

    return toProfessor(result.rows[0]);
  }

  async update(id: number, { nome, email, senha }: IUpdateProfessor) {
    const result = await pool.query<ProfessorRow>(
      `UPDATE techchallenge_user
       SET nome = $2, email = $3, senha = COALESCE($4, senha)
       WHERE id = $1 AND tipo_usuario_id = ${PROFESSOR_TYPE_ID_SQL}
       RETURNING id, nome, email, data_criacao`,
      [id, nome, email, senha ?? null],
    );

    const row = result.rows[0];

    return row ? toProfessor(row) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM techchallenge_user
       WHERE id = $1 AND tipo_usuario_id = ${PROFESSOR_TYPE_ID_SQL}`,
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }
}
