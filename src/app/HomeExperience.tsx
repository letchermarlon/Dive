"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OceanBackground from "@/components/OceanBackground";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import SignInForm from "./(auth)/sign-in/SignInForm";

export default function HomeExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuth, setShowAuth] = useState(() => searchParams.get("auth") === "1");

  useEffect(() => {
    setShowAuth(searchParams.get("auth") === "1");
  }, [searchParams]);

  function openAuth() {
    setShowAuth(true);
    router.replace("/?auth=1", { scroll: false });
  }

  function closeAuth() {
    setShowAuth(false);
    router.replace("/", { scroll: false });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OceanBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(164,255,245,0.16),transparent_30%),linear-gradient(180deg,rgba(4,12,19,0.18),rgba(4,12,19,0.7))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="relative flex w-full max-w-5xl items-center justify-center">
          <section
            className={cn(
              "flex w-full max-w-2xl flex-col items-center text-center transition-all duration-700 ease-out",
              showAuth
                ? "pointer-events-none -translate-y-10 scale-95 opacity-0 blur-sm"
                : "translate-y-0 scale-100 opacity-100 blur-0",
            )}
            aria-hidden={showAuth}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-200/20 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100/70 backdrop-blur-md">
              Team focus in one tide
            </div>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              Dive gives your team one place to plan, focus, and keep momentum moving.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cyan-50/75 sm:text-xl">
              Turn shared work into a living ocean of progress, with fast planning, calmer reviews,
              and a sign-in flow that starts exactly when people are ready.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                type="button"
                size="lg"
                onClick={openAuth}
                className="pointer-events-auto rounded-2xl bg-cyan-300 px-8 text-black shadow-[0_20px_60px_rgba(77,243,255,0.25)] hover:bg-cyan-200"
              >
                Get started
              </Button>
            </div>
          </section>

          <div
            className={cn(
              "absolute inset-x-0 mx-auto w-full max-w-md transition-all duration-700 ease-out",
              showAuth
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-10 opacity-0",
            )}
          >
            <SignInForm
              className="max-w-md"
              onBack={closeAuth}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
