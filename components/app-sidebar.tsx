"use client";

import {
  ChevronUpIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PackageIcon,
  PackageCheckIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLogout } from "@/hooks/use-auth";
import type { AuthUser } from "@/lib/api/auth-client";

type NavigationItem = {
  title: string;
  customerTitle?: string;
  href: string;
  icon: LucideIcon;
  roles: readonly AuthUser["role"][];
};

const navigation: readonly NavigationItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon, roles: ["ADMIN", "STAFF"] },
  {
    title: "Orders",
    customerTitle: "My orders",
    href: "/orders",
    icon: ShoppingBagIcon,
    roles: ["ADMIN", "STAFF", "CUSTOMER"],
  },
  { title: "Customers", href: "/customers", icon: UsersIcon, roles: ["ADMIN", "STAFF"] },
  { title: "Products", href: "/products", icon: PackageIcon, roles: ["ADMIN", "STAFF"] },
  { title: "Users", href: "/users", icon: ShieldCheckIcon, roles: ["ADMIN"] },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const items = navigation.filter((item) => item.roles.some((role) => role === user.role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Peach Supplement"
              render={<Link href={user.role === "CUSTOMER" ? "/orders" : "/dashboard"} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <PackageCheckIcon />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Peach Supplement</span>
                <span className="truncate text-xs text-muted-foreground">Order management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const label =
                  user.role === "CUSTOMER" && item.customerTitle ? item.customerTitle : item.title;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={label}
                      isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    tooltip={`${user.name} · ${user.role.toLowerCase()}`}
                  />
                }
              >
                <Avatar>
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.role.toLowerCase()}
                  </span>
                </div>
                <ChevronUpIcon className="ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <span className="block truncate text-foreground">{user.name}</span>
                    <span className="block truncate font-normal">{user.email}</span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={logout.isPending}
                    onClick={() => {
                      logout.mutate(undefined, { onSuccess: () => router.replace("/") });
                    }}
                  >
                    <LogOutIcon />
                    {logout.isPending ? "Signing out…" : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
