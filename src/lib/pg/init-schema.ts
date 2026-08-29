import { pool } from "./index.js";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS techchallenge_posts (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

export async function initializeSchema(): Promise<void> {
  try {
    await pool.query(CREATE_TABLE_SQL);
    console.log("Schema do banco inicializado com sucesso.");
  } catch (error) {
    console.error("Falha ao inicializar schema do banco:", error);
    throw error;
  }
}
