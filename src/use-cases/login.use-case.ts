import type {
  ILoginRequest,
  ILoginResponse,
} from "../entities/models/user.model.js";
import type { IUserRepository } from "../repositories/user.repository.interface.js";
import { UnauthorizedError } from "./errors/unauthorized-error.js";

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ email, senha }: ILoginRequest): Promise<ILoginResponse> {
    const user = await this.userRepository.findByEmailAndPassword(email, senha);

    if (!user) {
      throw new UnauthorizedError();
    }

    const userType = await this.userRepository.findUserTypeById(
      user.tipo_usuario_id,
    );

    if (!userType) {
      throw new UnauthorizedError();
    }

    return {
      token: userType.token,
      role: userType.descricao,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
    };
  }
}
