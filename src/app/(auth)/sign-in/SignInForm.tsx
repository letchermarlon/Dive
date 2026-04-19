"use client";

import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SignInForm() {
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
    <div
      className={cn(
        "flex flex-col gap-6 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl",
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-md text-white">
          <GalleryVerticalEnd className="size-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Welcome to Dive</h1>
        <p className="text-sm text-white/50">Sign in or create an account</p>
      </div>

      {sent ? (
        <p className="text-center text-sm text-cyan-300">
          Check your email for a magic link to sign in.
        </p>
      ) : (
        <form onSubmit={handleEmail} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white/70">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-medium"
          >
            {loading ? "Sending…" : "Continue with email"}
          </Button>
        </form>
      )}

      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
        <span className="relative z-10 bg-black/80 px-2 text-white/40">Or</span>
      </div>

      <Button
        variant="outline"
        type="button"
        onClick={handleGoogle}
        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Continue with Google
      </Button>

      <p className="text-center text-xs text-white/30">
        By continuing you agree to our{" "}
        <a
          href="#"
          className="underline underline-offset-4 hover:text-white/60"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="underline underline-offset-4 hover:text-white/60"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
