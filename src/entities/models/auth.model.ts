export type Role = "PROFESSOR" | "ALUNO";

export interface AuthContext {
  role: Role;
}
