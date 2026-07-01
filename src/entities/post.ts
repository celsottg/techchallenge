import type { IPost } from "./models/post.model.js";

export class Post implements IPost {
  id: number;
  titulo: string;
  conteudo: string;
  data_publicacao: Date;
  data_atualizacao: Date;

  constructor(data: IPost) {
    this.id = data.id;
    this.titulo = data.titulo;
    this.conteudo = data.conteudo;
    this.data_publicacao = data.data_publicacao;
    this.data_atualizacao = data.data_atualizacao;
  }
}
