import { AppwriteError } from "./appwrite";

export class OrpError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "OrpError";
    this.statusCode = statusCode;
  }
}

function logInternalError(error: unknown): void {
  const payload =
    error instanceof AppwriteError
      ? {
          name: error.name,
          message: error.message,
          status: error.status,
          type: error.type,
          stack: error.stack,
        }
      : error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : { value: String(error) };

  // Keep logs structured for easier filtering in Cloudflare logs.
  console.error("[orp-api-error]", JSON.stringify(payload));
}

export function toErrorResponse(error: unknown): { statusCode: number; message: string } {
  if (error instanceof OrpError) {
    return { statusCode: error.statusCode, message: error.message };
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "RateLimitError" &&
    "statusCode" in error
  ) {
    return { statusCode: 429, message: (error as unknown as { message: string }).message };
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "ZodError"
  ) {
    return { statusCode: 422, message: "Invalid request payload." };
  }

  if (error instanceof AppwriteError) {
    if (error.type === "user_already_exists" || error.type === "user_email_already_exists") {
      return { statusCode: 409, message: "An account with this email already exists." };
    }

    if (error.status === 400) {
      return { statusCode: 422, message: "Invalid request payload." };
    }

    if (error.status === 429) {
      return { statusCode: 429, message: "Rate limit exceeded. Try again in a minute." };
    }

    logInternalError(error);
    return { statusCode: 500, message: "Internal server error." };
  }

  if (error instanceof Error) {
    logInternalError(error);
    return { statusCode: 500, message: "Internal server error." };
  }

  logInternalError(error);
  return { statusCode: 500, message: "Internal server error." };
}
