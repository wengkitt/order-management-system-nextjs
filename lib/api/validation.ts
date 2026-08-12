import { z, type ZodType } from "zod";

import { ApiError, validationError } from "@/lib/api/errors";

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const result = schema.safeParse(body);
  if (!result.success) throw validationError(result.error);
  return result.data;
}

export const uuidSchema = z.uuid("Invalid ID");

export function parseUuid(id: string): string {
  const result = uuidSchema.safeParse(id);
  if (!result.success) throw new ApiError(400, "INVALID_ID", "Invalid ID");
  return result.data;
}

export function paginationFrom(url: string): { page: number; limit: number; offset: number } {
  const params = new URL(url).searchParams;
  const page = positiveInteger(params.get("page"), 1, 1, 100000);
  const limit = positiveInteger(params.get("limit"), 20, 1, 100);
  return { page, limit, offset: (page - 1) * limit };
}

export function positiveInteger(
  value: string | null,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new ApiError(
      400,
      "INVALID_QUERY_PARAMETER",
      `Expected an integer between ${minimum} and ${maximum}`,
    );
  }
  return parsed;
}

export function pagination(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

export function searchFrom(url: string): string {
  return new URL(url).searchParams.get("search")?.trim().slice(0, 200) ?? "";
}
