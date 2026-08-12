import { and, asc, eq, ilike, isNull } from "drizzle-orm";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { apiHandler, json } from "@/lib/api/response";
import { positiveInteger, searchFrom } from "@/lib/api/validation";

export const GET = apiHandler(async (request: Request) => {
  await authenticate(request, INTERNAL_ROLES);
  const search = searchFrom(request.url);
  const limit = positiveInteger(new URL(request.url).searchParams.get("limit"), 20, 1, 100);
  const data = await db
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .where(
      and(
        eq(customers.isActive, true),
        isNull(customers.deletedAt),
        search ? ilike(customers.name, `%${search}%`) : undefined,
      ),
    )
    .orderBy(asc(customers.name))
    .limit(limit);
  return json(data);
});
