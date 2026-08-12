"use client";

import { LoaderCircleIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";
import { useAuth } from "@/providers/auth-provider";

export function AuthenticatedLanding({ title }: { title: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <section className="flex w-full max-w-lg flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Signed in as {user.role.toLowerCase()}</p>
          <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {user.name}. This temporary authenticated route is ready for the next UI.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={logout.isPending}
          onClick={() => {
            logout.mutate(undefined, { onSuccess: () => router.replace("/") });
          }}
        >
          {logout.isPending ? (
            <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
          ) : (
            <LogOutIcon data-icon="inline-start" />
          )}
          Sign out
        </Button>
      </section>
    </main>
  );
}
