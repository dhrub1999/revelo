"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm({ next, role = "buyer" }: { next: string; role?: Role }) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { role } },
          });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 rounded-control focus-visible:border-brand focus-visible:ring-brand-ring/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-10 rounded-control focus-visible:border-brand focus-visible:ring-brand-ring/30"
        />
      </div>

      {error && (
        <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="mt-1 h-11 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
      >
        {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>

      <Button
        type="button"
        variant="link"
        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        className="h-auto justify-start p-0 text-sm text-brand"
      >
        {mode === "sign-in"
          ? `New here? Create a ${role} account`
          : "Already have an account? Sign in"}
      </Button>
    </form>
  );
}
