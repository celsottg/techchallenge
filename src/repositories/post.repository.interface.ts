import type {
  ICreatePost,
  IPost,
  IUpdatePost,
} from "../entities/models/post.model.js";

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
  findById(id: number): Promise<IPost | null>;
  searchPosts(term: string): Promise<IPost[]>;
  create(data: ICreatePost): Promise<IPost>;
  update(id: number, data: IUpdatePost): Promise<IPost | null>;
  delete(id: number): Promise<boolean>;
}
