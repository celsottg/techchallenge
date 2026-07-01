import { PostRepository } from "../../repositories/pg/post.repository.js";
import { FindPostsUseCase } from "../find-posts.use-case.js";

export function makeFindPostsUseCase() {
  const postRepository = new PostRepository();

  return new FindPostsUseCase(postRepository);
}
