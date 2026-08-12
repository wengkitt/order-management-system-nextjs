import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BellIcon, SearchIcon } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSessionUser } from "@/lib/api/auth";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { AuthProvider } from "@/providers/auth-provider";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);

  if (!user) redirect("/");

  function toTitleCase(str: string) {
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
            <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <p className="text-sm text-muted-foreground">{toTitleCase(user.role)} workspace</p>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <SearchIcon className="size-4" />
                <BellIcon className="size-4" />
                <span className="hidden text-sm sm:inline">12 Aug 2026</span>
              </div>
            </header>
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
