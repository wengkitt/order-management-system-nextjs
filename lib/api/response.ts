import { ApiError } from "@/lib/api/errors";

export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export function created(data: unknown): Response {
  return json(data, { status: 201 });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
      },
      { status: error.status },
    );
  }

  console.error(error);
  return json(
    { error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}

export function apiHandler<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response>,
): (...args: TArgs) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
