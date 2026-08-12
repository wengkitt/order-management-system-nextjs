"use client";

import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthenticatedLanding({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardDescription>Signed in as {user.role.toLowerCase()}</CardDescription>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Welcome, {user.name}. This temporary authenticated route is ready for the next UI.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
