export interface ICreateProfessor {
  nome: string;
  email: string;
  senha: string;
}

export interface IUpdateProfessor {
  nome: string;
  email: string;
  senha?: string;
}

export interface IProfessor {
  id: number;
  nome: string;
  email: string;
  data_criacao: Date;
}
