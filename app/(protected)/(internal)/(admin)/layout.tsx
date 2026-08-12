import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_ONLY, getSessionUser } from "@/lib/api/auth";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token, ADMIN_ONLY);

  if (!user) redirect("/dashboard");

  return children;
}
