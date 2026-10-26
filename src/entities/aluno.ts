import type { IAluno } from "./models/aluno.model.js";

export class Aluno implements IAluno {
  id: number;
  nome: string;
  email: string;
  data_criacao: Date;

  constructor(data: IAluno) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.data_criacao = data.data_criacao;
  }
}
