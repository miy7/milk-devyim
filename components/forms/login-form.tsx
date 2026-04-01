"use client";

import { useActionState } from "react";

import { signInAction } from "@/app/_actions/auth";
import { initialAuthActionState } from "@/lib/auth/auth-state";
import { Button } from "@/components/ui/button";
import { FieldMessage, Input, Label } from "@/components/ui/form-controls";

export function LoginForm() {
  const [state, action, pending] = useActionState(signInAction, initialAuthActionState);

  return (
    <form action={action} className="space-y-5">
      <div>
        <Label htmlFor="identifier">Email or username</Label>
        <Input
          id="identifier"
          name="identifier"
          placeholder="admin@milk-devyim.local"
          autoComplete="username"
        />
        <FieldMessage message={state.fieldErrors?.identifier} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <FieldMessage message={state.fieldErrors?.password} />
      </div>

      {state.message ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {state.message}
        </div>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}