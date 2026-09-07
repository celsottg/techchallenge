import { UserRepository } from "../../repositories/pg/user.repository.js";
import { LoginUseCase } from "../login.use-case.js";

export function makeLoginUseCase() {
  const userRepository = new UserRepository();

  return new LoginUseCase(userRepository);
}
