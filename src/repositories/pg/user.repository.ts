import { User } from "../../entities/user.js";
import { UserType } from "../../entities/usertype.js";
import type {
  IUser,
  IUserType,
} from "../../entities/models/user.model.js";
import type { IUserRepository } from "../user.repository.interface.js";
import { pool } from "../../lib/pg/index.js";

interface UserRow {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo_usuario_id: string;
  data_criacao: Date;
}

interface UserTypeRow {
  id: string;
  descricao: IUserType["descricao"];
  token: string;
}

export class UserRepository implements IUserRepository {
  async findByEmailAndPassword(
    email: string,
    senha: string,
  ): Promise<IUser | null> {
    const result = await pool.query<UserRow>(
      `SELECT id, nome, email, senha, tipo_usuario_id, data_criacao
       FROM techchallenge_user
       WHERE email = $1 AND senha = $2
       LIMIT 1`,
      [email, senha],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return new User({
      id: Number(row.id),
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      tipo_usuario_id: Number(row.tipo_usuario_id),
      data_criacao: row.data_criacao,
    });
  }

  async findUserTypeById(id: number): Promise<IUserType | null> {
    const result = await pool.query<UserTypeRow>(
      `SELECT id, descricao, token
       FROM techchallenge_usertype
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return new UserType({
      id: Number(row.id),
      descricao: row.descricao,
      token: row.token,
    });
  }
}
