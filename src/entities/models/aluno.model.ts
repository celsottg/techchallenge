export interface ICreateAluno {
  nome: string;
  email: string;
  senha: string;
}

export interface IUpdateAluno {
  nome: string;
  email: string;
  senha?: string;
}

export interface IAluno {
  id: number;
  nome: string;
  email: string;
  data_criacao: Date;
}
