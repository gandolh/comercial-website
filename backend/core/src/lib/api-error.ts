/**
 * AppError — domain error class mirroring the Rust backend's error enum.
 * Each instance carries statusCode and publicMessage for HTTP responses.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly publicMessage: string;
  override readonly cause?: unknown;

  constructor(statusCode: number, publicMessage: string, cause?: unknown) {
    super(publicMessage);
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
    this.cause = cause;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(): AppError {
    return new AppError(404, "not found");
  }

  static unauthorized(): AppError {
    return new AppError(401, "unauthorized");
  }

  static forbidden(): AppError {
    return new AppError(403, "forbidden");
  }

  static validation(message: string): AppError {
    return new AppError(422, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static rateLimit(): AppError {
    return new AppError(429, "rate limit exceeded");
  }

  static internal(cause?: unknown): AppError {
    return new AppError(500, "internal error", cause);
  }
}

/**
 * A route's `schemaErrorFormatter` for a route that has always answered one fixed message when its input
 * fails, whichever field it was ("Invalid query parameters"): the error plugin answers it as any AppError,
 * 422 with that message. Routes without one answer the first issue's message.
 */
export function fixedValidationMessage(message: string): () => AppError {
  return () => AppError.validation(message);
}
