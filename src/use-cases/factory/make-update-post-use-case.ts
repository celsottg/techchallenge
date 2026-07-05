import { PostRepository } from "../../repositories/pg/post.repository.js";
import { UpdatePostUseCase } from "../update-post.use-case.js";

export function makeUpdatePostUseCase() {
  const postRepository = new PostRepository();

  return new UpdatePostUseCase(postRepository);
}
