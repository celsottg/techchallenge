import type { IUserType } from "./models/user.model.js";

export class UserType implements IUserType {
  id: number;
  descricao: IUserType["descricao"];
  token: string;

  constructor(data: IUserType) {
    this.id = data.id;
    this.descricao = data.descricao;
    this.token = data.token;
  }
}
