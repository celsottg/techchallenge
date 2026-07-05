import type { ICreatePost, IPost } from "../entities/models/post.model.js";
import type { IPostRepository } from "../repositories/post.repository.interface.js";

export class CreatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(data: ICreatePost): Promise<IPost> {
    return this.postRepository.create(data);
  }
}
