import { Post } from "../../entities/post.js";
import type { ICreatePost } from "../../entities/models/post.model.js";
import type {
  FindAllPostsParams,
  FindAllPostsResult,
  IPostRepository,
} from "../post.repository.interface.js";
import { pool } from "../../lib/pg/index.js";

interface PostRow {
  id: string;
  titulo: string;
  conteudo: string;
  data_publicacao: Date;
  data_atualizacao: Date;
}

export class PostRepository implements IPostRepository {
  async findAll({ page, limit }: FindAllPostsParams): Promise<FindAllPostsResult> {
    const offset = (page - 1) * limit;

    const [postsResult, countResult] = await Promise.all([
      pool.query<PostRow>(
        `SELECT id, titulo, conteudo, data_publicacao, data_atualizacao
         FROM techchallenge_posts
         ORDER BY data_publicacao DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      pool.query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM techchallenge_posts",
      ),
    ]);

    const posts = postsResult.rows.map(
      (row) =>
        new Post({
          id: Number(row.id),
          titulo: row.titulo,
          conteudo: row.conteudo,
          data_publicacao: row.data_publicacao,
          data_atualizacao: row.data_atualizacao,
        }),
    );

    return {
      posts,
      total: Number(countResult.rows[0]?.count ?? 0),
    };
  }

  async create({ titulo, conteudo }: ICreatePost) {
    const result = await pool.query<PostRow>(
      `INSERT INTO techchallenge_posts (titulo, conteudo)
       VALUES ($1, $2)
       RETURNING id, titulo, conteudo, data_publicacao, data_atualizacao`,
      [titulo, conteudo],
    );

    const row = result.rows[0];

    return new Post({
      id: Number(row.id),
      titulo: row.titulo,
      conteudo: row.conteudo,
      data_publicacao: row.data_publicacao,
      data_atualizacao: row.data_atualizacao,
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM techchallenge_posts WHERE id = $1",
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }
}
