import type { Role } from "../../entities/models/auth.model.js";
import { pool } from "../../lib/pg/index.js";

export interface UserByRoleRow {
  id: string;
  nome: string;
  email: string;
  data_criacao: Date;
}

interface CreateUserByRoleData {
  nome: string;
  email: string;
  senha: string;
}

interface UpdateUserByRoleData {
  nome: string;
  email: string;
  senha?: string;
}

// Base para repositórios de usuários de um papel (PROFESSOR, ALUNO) em
// techchallenge_user; todas as queries filtram pelo papel para nunca tocar
// em usuários de outro tipo.
export class UserByRoleRepository<T> {
  private readonly roleTypeIdSql: string;

  constructor(
    role: Role,
    private readonly toEntity: (row: UserByRoleRow) => T,
  ) {
    // role é um literal da union Role, nunca entrada do usuário.
    this.roleTypeIdSql = `(SELECT id FROM techchallenge_usertype WHERE descricao = '${role}')`;
  }

  protected async findAllByRole(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [usersResult, countResult] = await Promise.all([
      pool.query<UserByRoleRow>(
        `SELECT id, nome, email, data_criacao
         FROM techchallenge_user
         WHERE tipo_usuario_id = ${this.roleTypeIdSql}
         ORDER BY nome ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM techchallenge_user
         WHERE tipo_usuario_id = ${this.roleTypeIdSql}`,
      ),
    ]);

    return {
      users: usersResult.rows.map(this.toEntity),
      total: Number(countResult.rows[0]?.count ?? 0),
    };
  }

  async findById(id: number): Promise<T | null> {
    const result = await pool.query<UserByRoleRow>(
      `SELECT id, nome, email, data_criacao
       FROM techchallenge_user
       WHERE id = $1 AND tipo_usuario_id = ${this.roleTypeIdSql}`,
      [id],
    );

    const row = result.rows[0];

    return row ? this.toEntity(row) : null;
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

  async create({ nome, email, senha }: CreateUserByRoleData): Promise<T> {
    const result = await pool.query<UserByRoleRow>(
      `INSERT INTO techchallenge_user (nome, email, senha, tipo_usuario_id)
       VALUES ($1, $2, $3, ${this.roleTypeIdSql})
       RETURNING id, nome, email, data_criacao`,
      [nome, email, senha],
    );

    return this.toEntity(result.rows[0]);
  }

  async update(
    id: number,
    { nome, email, senha }: UpdateUserByRoleData,
  ): Promise<T | null> {
    const result = await pool.query<UserByRoleRow>(
      `UPDATE techchallenge_user
       SET nome = $2, email = $3, senha = COALESCE($4, senha)
       WHERE id = $1 AND tipo_usuario_id = ${this.roleTypeIdSql}
       RETURNING id, nome, email, data_criacao`,
      [id, nome, email, senha ?? null],
    );

    const row = result.rows[0];

    return row ? this.toEntity(row) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM techchallenge_user
       WHERE id = $1 AND tipo_usuario_id = ${this.roleTypeIdSql}`,
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }
}
