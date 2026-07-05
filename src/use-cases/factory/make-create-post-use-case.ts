import { PostRepository } from "../../repositories/pg/post.repository.js";
import { CreatePostUseCase } from "../create-post.use-case.js";

export function makeCreatePostUseCase() {
  const postRepository = new PostRepository();

  return new CreatePostUseCase(postRepository);
}
