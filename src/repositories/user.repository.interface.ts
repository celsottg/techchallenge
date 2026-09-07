import type {
  IUser,
  IUserType,
} from "../entities/models/user.model.js";

export interface IUserRepository {
  findByEmailAndPassword(email: string, senha: string): Promise<IUser | null>;
  findUserTypeById(id: number): Promise<IUserType | null>;
}
