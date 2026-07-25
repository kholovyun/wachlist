export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFound(message = "Not found") {
  return new AppError(404, message);
}

export function conflict(message: string) {
  return new AppError(409, message);
}
