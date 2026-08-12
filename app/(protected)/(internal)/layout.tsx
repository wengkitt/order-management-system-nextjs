import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionUser, INTERNAL_ROLES } from "@/lib/api/auth";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token, INTERNAL_ROLES);

  if (!user) redirect("/orders");

  return children;
}
