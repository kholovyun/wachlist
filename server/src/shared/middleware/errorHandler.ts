import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/httpErrors.js";
import { logger } from "../logger.js";

function isHttpError(
  err: unknown
): err is Error & { status?: number; statusCode?: number; type?: string } {
  return err instanceof Error;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = req.requestId;

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (isHttpError(err)) {
    const status = err.statusCode ?? err.status;
    if (status && status >= 400 && status < 500) {
      const message =
        err.type === "entity.parse.failed"
          ? "Invalid JSON body"
          : err.message || "Bad request";
      res.status(status).json({ error: { message } });
      return;
    }

    if (
      "code" in err &&
      typeof err.code === "string" &&
      err.code.startsWith("SQLITE_CONSTRAINT")
    ) {
      res.status(409).json({
        error: {
          message: "A wallet with this address already exists on this network",
        },
      });
      return;
    }
  }

  logger.error("unhandled_error", {
    requestId,
    err:
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : err,
  });

  res.status(500).json({
    error: { message: "Internal server error" },
  });
}
