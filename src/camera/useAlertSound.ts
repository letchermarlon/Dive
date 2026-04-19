"use client";

import { useRef, useCallback } from "react";

// Cooldown between alerts so it doesn't spam
const ALERT_COOLDOWN_MS = 1000;

// Generates a bell/chime tone using Web Audio API — no files needed
function playChime(ctx: AudioContext) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);       // A5 — bright chime pitch
  oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8); // decay to A4

  gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2); // fade out

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 1.2);
}

export function useAlertSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef<number>(0);

  const playAlert = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayedRef.current < ALERT_COOLDOWN_MS) return;
    lastPlayedRef.current = now;

    // AudioContext must be created after a user gesture — lazy init
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    playChime(audioCtxRef.current);
  }, []);

  return { playAlert };
}