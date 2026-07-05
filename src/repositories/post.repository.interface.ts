import type { ICreatePost, IPost } from "../entities/models/post.model.js";

export interface FindAllPostsParams {
  page: number;
  limit: number;
}

export interface FindAllPostsResult {
  posts: IPost[];
  total: number;
}

export interface IPostRepository {
  findAll(params: FindAllPostsParams): Promise<FindAllPostsResult>;
  create(data: ICreatePost): Promise<IPost>;
  delete(id: number): Promise<boolean>;
}
