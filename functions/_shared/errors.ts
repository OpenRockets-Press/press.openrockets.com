export class OrpError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "OrpError";
    this.statusCode = statusCode;
  }
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

  if (error instanceof Error) {
    return { statusCode: 500, message: "Internal server error." };
  }

  return { statusCode: 500, message: "Internal server error." };
}
