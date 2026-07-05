import type { IPost } from "../entities/models/post.model.js";
import type { IPostRepository } from "../repositories/post.repository.interface.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

export class FindPostByIdUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(id: number): Promise<IPost> {
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new ResourceNotFoundError();
    }

    return post;
  }
}
