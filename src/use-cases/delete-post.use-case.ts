import type { IPostRepository } from "../repositories/post.repository.interface.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

export class DeletePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.postRepository.delete(id);

    if (!deleted) {
      throw new ResourceNotFoundError();
    }
  }
}
