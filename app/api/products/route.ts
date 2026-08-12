import { and, asc, count, eq, ilike, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { products } from "@/db/schema";
import { ADMIN_ONLY, authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { ApiError, isDatabaseError } from "@/lib/api/errors";
import { apiHandler, created, json } from "@/lib/api/response";
import { pagination, paginationFrom, parseJson, searchFrom } from "@/lib/api/validation";

const productInputSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  category: z.string().trim().min(1).max(100),
  price: z.coerce.number().finite().nonnegative().max(99999999.99),
  stockQuantity: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

function serializeProduct<T extends { price: string }>(product: T) {
  return { ...product, price: Number(product.price) };
}

export const GET = apiHandler(async (request: Request) => {
  await authenticate(request, INTERNAL_ROLES);
  const { page, limit, offset } = paginationFrom(request.url);
  const url = new URL(request.url);
  const search = searchFrom(request.url);
  const filters = [isNull(products.deletedAt)];
  const category = url.searchParams.get("category")?.trim();
  const isActive = url.searchParams.get("isActive");
  if (search)
    filters.push(or(ilike(products.name, `%${search}%`), ilike(products.sku, `%${search}%`))!);
  if (category) filters.push(eq(products.category, category));
  if (isActive === "true" || isActive === "false")
    filters.push(eq(products.isActive, isActive === "true"));
  const where = and(...filters);
  const [data, totals] = await Promise.all([
    db.select().from(products).where(where).orderBy(asc(products.name)).limit(limit).offset(offset),
    db.select({ total: count() }).from(products).where(where),
  ]);
  return json({
    data: data.map(serializeProduct),
    pagination: pagination(page, limit, totals[0]?.total ?? 0),
  });
});

export const POST = apiHandler(async (request: Request) => {
  const actor = await authenticate(request, ADMIN_ONLY);
  const input = await parseJson(request, productInputSchema);
  try {
    const [product] = await db
      .insert(products)
      .values({ ...input, price: input.price.toFixed(2), createdBy: actor.id })
      .returning();
    return created(serializeProduct(product));
  } catch (error) {
    if (isDatabaseError(error, "23505"))
      throw new ApiError(409, "SKU_EXISTS", "SKU already exists");
    throw error;
  }
});
