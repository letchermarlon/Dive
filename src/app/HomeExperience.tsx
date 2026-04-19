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
  const [showAuth, setShowAuth] = useState(
    () => searchParams.get("auth") === "1",
  );

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(164,255,245,0.12),transparent_24%),linear-gradient(180deg,rgba(4,12,19,0.14),rgba(4,12,19,0.78))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12 sm:py-16">
        <div className="relative flex w-full max-w-6xl items-center justify-center">
          <section
            className={cn(
              "flex w-full max-w-4xl flex-col items-center text-center transition-all duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
              showAuth
                ? "pointer-events-none -translate-y-[105vh] opacity-0"
                : "translate-y-0 opacity-100",
            )}
            aria-hidden={showAuth}
          >
            <h1 className="max-w-5xl text-6xl font-bold tracking-[-0.05em] text-white sm:text-7xl md:text-8xl lg:text-[7rem]">
              Dive.
            </h1>
            <p className="mt-4 max-w-2xl text-xl leading-8 text-white/72 sm:text-2xl sm:leading-9">
              Dive keeps planning, focus, and follow-through in one calm flow
              for your team.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                type="button"
                size="lg"
                onClick={openAuth}
                className="pointer-events-auto h-14 rounded-2xl bg-white px-9 text-lg font-semibold text-black shadow-[0_20px_60px_rgba(77,243,255,0.18)] hover:bg-white/90"
              >
                Get started
              </Button>
            </div>
            <div className="mt-12 grid w-full max-w-5xl gap-5 md:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 text-left backdrop-blur-md">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-100/65">
                  Plan
                </p>
                <p className="mt-4 text-2xl font-semibold text-white">
                  Move from idea to next step.
                </p>
                <p className="mt-3 text-base leading-7 text-white/65">
                  Keep priorities visible without turning your workflow into
                  noise.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 text-left backdrop-blur-md">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-100/65">
                  Focus
                </p>
                <p className="mt-4 text-2xl font-semibold text-white">
                  Stay aligned without chasing updates.
                </p>
                <p className="mt-3 text-base leading-7 text-white/65">
                  Give everyone one shared view of what matters right now.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 text-left backdrop-blur-md">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-100/65">
                  Flow
                </p>
                <p className="mt-4 text-2xl font-semibold text-white">
                  Let progress feel steady.
                </p>
                <p className="mt-3 text-base leading-7 text-white/65">
                  Replace scattered status checking with calm forward motion.
                </p>
              </div>
            </div>
          </section>

          <div
            className={cn(
              "absolute inset-x-0 mx-auto w-full max-w-md transition-all duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
              showAuth
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-[105vh] opacity-0",
            )}
          >
            <SignInForm className="max-w-md" onBack={closeAuth} />
          </div>
        </div>
      </div>
    </div>
  );
}
