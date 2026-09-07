import type { IUser } from "./models/user.model.js";

export class User implements IUser {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo_usuario_id: number;
  data_criacao: Date;

  constructor(data: IUser) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senha = data.senha;
    this.tipo_usuario_id = data.tipo_usuario_id;
    this.data_criacao = data.data_criacao;
  }
}
