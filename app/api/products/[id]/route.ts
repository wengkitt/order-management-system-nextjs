import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { products } from "@/db/schema";
import { ADMIN_ONLY, authenticate, INTERNAL_ROLES } from "@/lib/api/auth";
import { ApiError, isDatabaseError } from "@/lib/api/errors";
import { apiHandler, json, noContent } from "@/lib/api/response";
import { parseJson, parseUuid } from "@/lib/api/validation";
const updateProductSchema = z
  .object({
    sku: z.string().trim().min(1).max(100).optional(),
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(10000).nullable().optional(),
    category: z.string().trim().min(1).max(100).optional(),
    price: z.coerce.number().finite().nonnegative().max(99999999.99).optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    lowStockThreshold: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

function serializeProduct<T extends { price: string }>(product: T) {
  return { ...product, price: Number(product.price) };
}

type Context = { params: Promise<{ id: string }> };

async function productId(context: Context) {
  return parseUuid((await context.params).id);
}

export const GET = apiHandler(async (request: Request, context: Context) => {
  await authenticate(request, INTERNAL_ROLES);
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, await productId(context)), isNull(products.deletedAt)))
    .limit(1);
  if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
  return json(serializeProduct(product));
});

export const PATCH = apiHandler(async (request: Request, context: Context) => {
  const actor = await authenticate(request, ADMIN_ONLY);
  const id = await productId(context);
  const input = await parseJson(request, updateProductSchema);
  const { price, ...changes } = input;
  try {
    const [product] = await db
      .update(products)
      .set({
        ...changes,
        ...(price === undefined ? {} : { price: price.toFixed(2) }),
        updatedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .returning();
    if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    return json(serializeProduct(product));
  } catch (error) {
    if (isDatabaseError(error, "23505"))
      throw new ApiError(409, "SKU_EXISTS", "SKU already exists");
    throw error;
  }
});

export const DELETE = apiHandler(async (request: Request, context: Context) => {
  const actor = await authenticate(request, ADMIN_ONLY);
  const [product] = await db
    .update(products)
    .set({ isActive: false, deletedAt: new Date(), updatedAt: new Date(), updatedBy: actor.id })
    .where(and(eq(products.id, await productId(context)), isNull(products.deletedAt)))
    .returning({ id: products.id });
  if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
  return noContent();
});
