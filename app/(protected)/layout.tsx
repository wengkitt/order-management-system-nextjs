import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/api/auth";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { AuthProvider } from "@/providers/auth-provider";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);

  if (!user) redirect("/");

  return <AuthProvider initialUser={user}>{children}</AuthProvider>;
}
