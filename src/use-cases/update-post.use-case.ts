import type { IPost } from "../entities/models/post.model.js";
import type { IPostRepository } from "../repositories/post.repository.interface.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface UpdatePostUseCaseRequest {
  id: number;
  titulo: string;
  conteudo: string;
}

export class UpdatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute({
    id,
    titulo,
    conteudo,
  }: UpdatePostUseCaseRequest): Promise<IPost> {
    const post = await this.postRepository.update(id, { titulo, conteudo });

    if (!post) {
      throw new ResourceNotFoundError();
    }

    return post;
  }
}
