import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSessionUser } from "@/lib/api/auth";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { AuthProvider } from "@/providers/auth-provider";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);

  if (!user) redirect("/");

  function toTitleCase(str: String) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <AuthProvider initialUser={user}>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar user={user} />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <p className="text-sm text-muted-foreground">{toTitleCase(user.role)} Workspace</p>
            </header>
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
