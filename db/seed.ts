import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

loadEnvConfig(process.cwd());
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const db = drizzle({ client: neon(connectionString), schema });

async function seed() {
  const email = "admin@example.com";
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email));
  if (existing) {
    console.log(`Seed skipped: ${email} already exists`);
    return;
  }
  await db.insert(schema.users).values({
    name: "Admin User",
    email,
    passwordHash: await hash("password", 12),
    phoneNumber: "0123456789",
    role: "ADMIN",
  });
  console.log(`Created ${email} with development password: password`);
}
seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
