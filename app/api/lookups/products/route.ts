import { and, asc, eq, ilike, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";
import { authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { apiHandler, json } from "@/lib/api/response";
import { positiveInteger, searchFrom } from "@/lib/api/validation";

export const GET = apiHandler(async (request: Request) => {
  await authenticate(request, INTERNAL_ROLES);
  const search = searchFrom(request.url);
  const limit = positiveInteger(new URL(request.url).searchParams.get("limit"), 20, 1, 100);
  const data = await db
    .select({ id: products.id, name: products.name, sku: products.sku, price: products.price })
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        isNull(products.deletedAt),
        search
          ? or(ilike(products.name, `%${search}%`), ilike(products.sku, `%${search}%`))
          : undefined,
      ),
    )
    .orderBy(asc(products.name))
    .limit(limit);
  return json(data.map((product) => ({ ...product, price: Number(product.price) })));
});
