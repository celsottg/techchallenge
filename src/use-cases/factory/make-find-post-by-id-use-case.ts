import { PostRepository } from "../../repositories/pg/post.repository.js";
import { FindPostByIdUseCase } from "../find-post-by-id.use-case.js";

export function makeFindPostByIdUseCase() {
  const postRepository = new PostRepository();

  return new FindPostByIdUseCase(postRepository);
}
