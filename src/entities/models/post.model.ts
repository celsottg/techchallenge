export interface ICreatePost {
  titulo: string;
  conteudo: string;
}

export interface IUpdatePost {
  titulo: string;
  conteudo: string;
}

export interface IPost {
  id: number;
  titulo: string;
  conteudo: string;
  data_publicacao: Date;
  data_atualizacao: Date;
}
