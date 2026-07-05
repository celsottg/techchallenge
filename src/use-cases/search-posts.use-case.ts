import type { IPost } from "../entities/models/post.model.js";
import type { IPostRepository } from "../repositories/post.repository.interface.js";

interface SearchPostsUseCaseRequest {
  search: string;
}

interface SearchPostsUseCaseResponse {
  posts: IPost[];
}

export class SearchPostsUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute({
    search,
  }: SearchPostsUseCaseRequest): Promise<SearchPostsUseCaseResponse> {
    const posts = await this.postRepository.searchPosts(search);

    return { posts };
  }
}
