import { env } from "../../env/index.js";
import { pool } from "./index.js";

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS techchallenge_posts (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS techchallenge_usertype (
    id BIGSERIAL PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS techchallenge_user (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario_id BIGINT
        REFERENCES techchallenge_usertype(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

export async function initializeSchema(): Promise<void> {
  try {
    await pool.query(CREATE_TABLES_SQL);

    await pool.query(
      `
      INSERT INTO techchallenge_usertype (id, descricao, token)
      VALUES
          (1, 'PROFESSOR', $1),
          (2, 'ALUNO',     $2)
      ON CONFLICT (id) DO NOTHING;
      `,
      [env.PROFESSOR_ACCESS_TOKEN, env.ALUNO_ACCESS_TOKEN],
    );

    await pool.query(
      `SELECT setval(pg_get_serial_sequence('techchallenge_usertype', 'id'),
                    (SELECT COALESCE(MAX(id), 0) FROM techchallenge_usertype))`,
    );

    await pool.query(
      `SELECT setval(pg_get_serial_sequence('techchallenge_posts', 'id'),
                    (SELECT COALESCE(MAX(id), 0) FROM techchallenge_posts))`,
    );

    await pool.query(
      `SELECT setval(pg_get_serial_sequence('techchallenge_user', 'id'),
                    (SELECT COALESCE(MAX(id), 0) FROM techchallenge_user))`,
    );

    console.log("Schema do banco inicializado com sucesso.");
  } catch (error) {
    console.error("Falha ao inicializar schema do banco:", error);
    throw error;
  }
}
