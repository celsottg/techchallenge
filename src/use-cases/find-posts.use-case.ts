import type {
  FindAllPostsParams,
  FindAllPostsResult,
  IPostRepository,
} from "../repositories/post.repository.interface.js";

export class FindPostsUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(params: FindAllPostsParams): Promise<FindAllPostsResult> {
    return this.postRepository.findAll(params);
  }
}
