import { describe, expect, it } from "@jest/globals";

import { Post } from "../../entities/post.js";
import { mockPost } from "../mocks/post.mock.js";

describe("Post", () => {
  it("deve mapear corretamente os campos no construtor", () => {
    const post = new Post(mockPost);

    expect(post.id).toBe(mockPost.id);
    expect(post.titulo).toBe(mockPost.titulo);
    expect(post.conteudo).toBe(mockPost.conteudo);
    expect(post.data_publicacao).toBe(mockPost.data_publicacao);
    expect(post.data_atualizacao).toBe(mockPost.data_atualizacao);
  });
});
