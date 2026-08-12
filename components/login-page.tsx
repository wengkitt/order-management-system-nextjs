"use client";

import { useForm } from "@tanstack/react-form";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { loginEmailSchema, loginPasswordSchema, loginSchema } from "@/lib/schema/loginSchema";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      const user = await login.mutateAsync(value);
      router.replace(user.role === "CUSTOMER" ? "/orders" : "/dashboard");
    },
  });

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden min-h-screen flex-col justify-between bg-foreground p-10 text-background lg:flex xl:p-14">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-background text-sm font-medium text-foreground">
            PS
          </div>
          <p className="text-lg font-medium">Peach Supplement</p>
        </div>

        <div className="flex max-w-xl flex-col gap-4">
          <h1 className="text-4xl leading-tight font-medium tracking-tight xl:text-5xl">
            Operations stay clear from order to delivery.
          </h1>
          <p className="max-w-lg text-base text-background/60">
            A focused workspace for managing customers, inventory, and fulfilment.
          </p>
        </div>

        <p className="text-sm text-background/60">
          Order management system · {new Date().getFullYear()}
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="flex w-full max-w-sm flex-col gap-7">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">
              PS
            </div>
            <p className="text-lg font-medium">Peach Supplement</p>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-medium tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your operations workspace.</p>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="email"
                validators={{
                  onBlur: loginEmailSchema,
                }}
              >
                {(field) => {
                  const invalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={invalid}
                      />
                      {invalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onBlur: loginPasswordSchema,
                }}
              >
                {(field) => {
                  const invalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={invalid}
                      />
                      {invalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <div className="flex flex-col gap-3">
                  {login.error && <FieldError aria-live="polite">{login.error.message}</FieldError>}
                  <Button type="submit" size="lg" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting && (
                      <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
                    )}
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </Button>
                </div>
              )}
            </form.Subscribe>
          </form>
        </div>
      </section>
    </main>
  );
}
