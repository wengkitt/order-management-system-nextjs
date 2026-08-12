import { cookies } from "next/headers";

import { apiHandler, noContent } from "@/lib/api/response";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export const POST = apiHandler(async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return noContent();
});
