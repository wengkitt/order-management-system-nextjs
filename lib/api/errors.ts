import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export function validationError(error: ZodError): ApiError {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".") || "body";
    fields[field] ??= issue.message;
  }

  return new ApiError(422, "VALIDATION_ERROR", "Invalid request", fields);
}

export function isDatabaseError(error: unknown, code: string): boolean {
  if (!error || typeof error !== "object") return false;
  if ("code" in error && error.code === code) return true;
  return "cause" in error && isDatabaseError(error.cause, code);
}
