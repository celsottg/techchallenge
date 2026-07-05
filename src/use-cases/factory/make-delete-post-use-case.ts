import { PostRepository } from "../../repositories/pg/post.repository.js";
import { DeletePostUseCase } from "../delete-post.use-case.js";

export function makeDeletePostUseCase() {
  const postRepository = new PostRepository();

  return new DeletePostUseCase(postRepository);
}
