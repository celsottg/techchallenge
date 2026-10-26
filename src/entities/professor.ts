import type { IProfessor } from "./models/professor.model.js";

export class Professor implements IProfessor {
  id: number;
  nome: string;
  email: string;
  data_criacao: Date;

  constructor(data: IProfessor) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.data_criacao = data.data_criacao;
  }
}
