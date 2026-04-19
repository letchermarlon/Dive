"use client";

import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SignInFormProps = {
  className?: string;
  onBack?: () => void;
};

export default function SignInForm({ className, onBack }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSent(true);
    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className={cn("flex flex-col gap-7 px-2 py-4", className)}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center text-white">
          <GalleryVerticalEnd className="size-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
            Welcome back
          </h1>
          <p className="text-lg font-medium text-white/75">
            Enter your email to continue into Dive.
          </p>
        </div>
      </div>

      {sent ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center text-base text-white/85 backdrop-blur-sm">
          Check your email for a magic link to sign in.
        </div>
      ) : (
        <form onSubmit={handleEmail} className="flex flex-col gap-5">
          <div className="grid gap-3">
            <Label
              htmlFor="email"
              className="text-lg font-medium text-white/90"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 rounded-xl border-white/12 bg-black/20 px-4 text-lg text-white placeholder:text-white/35 focus:border-white/25"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-xl bg-white text-lg font-semibold text-black hover:bg-white/90"
          >
            {loading ? "Sending..." : "Login"}
          </Button>
        </form>
      )}

      <div className="relative text-center text-lg after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/35">
        <span className="relative z-10 rounded-full bg-[rgba(4,12,19,0.9)] px-3 font-medium text-white backdrop-blur-sm">
          Or
        </span>
      </div>

      <Button
        variant="outline"
        type="button"
        onClick={handleGoogle}
        className="h-14 w-full rounded-xl border-white/15 bg-black/20 text-lg text-white hover:bg-white/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-5"
        >
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Continue with Google
      </Button>

      <p className="text-center text-sm leading-6 text-white/55">
        By clicking continue, you agree to our{" "}
        <a
          href="#"
          className="underline underline-offset-4 hover:text-white/80"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="underline underline-offset-4 hover:text-white/80"
        >
          Privacy Policy
        </a>
        .
      </p>

      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-center text-sm font-medium text-white/65 transition-colors hover:text-white/90"
        >
          Back to overview
        </button>
      ) : null}
    </div>
  );
}
