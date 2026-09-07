import type { Role } from "./auth.model.js";

export interface IUser {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo_usuario_id: number;
  data_criacao: Date;
}

export interface IUserType {
  id: number;
  descricao: Role;
  token: string;
}

export interface ILoginRequest {
  email: string;
  senha: string;
}

export interface ILoginResponse {
  token: string;
  role: Role;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface ILoginUserPayload {
  id: number;
  nome: string;
  email: string;
}
