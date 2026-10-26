import type {
  ICreateAluno,
  IAluno,
  IUpdateAluno,
} from "../entities/models/aluno.model.js";

export interface FindAllAlunosParams {
  page: number;
  limit: number;
}

export interface FindAllAlunosResult {
  alunos: IAluno[];
  total: number;
}

export interface IAlunoRepository {
  findAll(params: FindAllAlunosParams): Promise<FindAllAlunosResult>;
  findById(id: number): Promise<IAluno | null>;
  isEmailInUse(email: string, ignoreUserId?: number): Promise<boolean>;
  create(data: ICreateAluno): Promise<IAluno>;
  update(id: number, data: IUpdateAluno): Promise<IAluno | null>;
  delete(id: number): Promise<boolean>;
}
