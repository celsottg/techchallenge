import { describe, expect, it, jest } from "@jest/globals";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error.js";
import { globalErrorHandler } from "../../utils/global-error-handler.js";

function createMockReply() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as FastifyReply;
}

describe("globalErrorHandler", () => {
  const request = {} as FastifyRequest;

  it("deve retornar 400 para erros de validação Zod", () => {
    const schema = z.object({ titulo: z.string().min(1) });
    let zodError: z.ZodError;

    try {
      schema.parse({ titulo: "" });
    } catch (error) {
      zodError = error as z.ZodError;
    }

    const reply = createMockReply();

    globalErrorHandler(zodError!, request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Validation error",
      errors: expect.any(Object),
    });
  });

  it("deve retornar 404 para ResourceNotFoundError", () => {
    const reply = createMockReply();

    globalErrorHandler(new ResourceNotFoundError(), request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Resource not found",
    });
  });

  it("deve retornar 500 para erros genéricos", () => {
    const reply = createMockReply();
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    globalErrorHandler(new Error("Erro inesperado"), request, reply);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Internal server error",
    });

    consoleErrorSpy.mockRestore();
  });
});
