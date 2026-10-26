import type {
  ICreateProfessor,
  IProfessor,
  IUpdateProfessor,
} from "../entities/models/professor.model.js";

export interface FindAllProfessorsParams {
  page: number;
  limit: number;
}

export interface FindAllProfessorsResult {
  professores: IProfessor[];
  total: number;
}

export interface IProfessorRepository {
  findAll(params: FindAllProfessorsParams): Promise<FindAllProfessorsResult>;
  findById(id: number): Promise<IProfessor | null>;
  isEmailInUse(email: string, ignoreUserId?: number): Promise<boolean>;
  create(data: ICreateProfessor): Promise<IProfessor>;
  update(id: number, data: IUpdateProfessor): Promise<IProfessor | null>;
  delete(id: number): Promise<boolean>;
}
