import { PostRepository } from "../../repositories/pg/post.repository.js";
import { SearchPostsUseCase } from "../search-posts.use-case.js";

export function makeSearchPostsUseCase() {
  const postRepository = new PostRepository();

  return new SearchPostsUseCase(postRepository);
}
