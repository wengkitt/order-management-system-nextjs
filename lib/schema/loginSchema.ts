import { z } from "zod";

export const loginEmailSchema = z.email("Enter a valid email address").trim().toLowerCase();

export const loginPasswordSchema = z
  .string()
  .trim()
  .min(1, "Password is required")
  .max(200, "Password must be 200 characters or fewer");

export const loginSchema = z.object({
  email: loginEmailSchema,
  password: loginPasswordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
