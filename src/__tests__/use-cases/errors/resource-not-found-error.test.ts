import { describe, expect, it } from "@jest/globals";

import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error.js";

describe("ResourceNotFoundError", () => {
  it("deve ter a mensagem Resource not found", () => {
    const error = new ResourceNotFoundError();

    expect(error.message).toBe("Resource not found");
    expect(error).toBeInstanceOf(Error);
  });
});
