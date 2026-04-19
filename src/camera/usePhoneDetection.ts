"use client";

import { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export type PhoneState = "none" | "detected";

const DETECTION_INTERVAL_MS = 500;

const PHONE_FRONT_THRESHOLD = 0.15;   // lower = catches distant/back-facing phones
const REMOTE_PROXY_THRESHOLD = 0.4;   // phone backs often register as "remote"
const MIN_AREA_FRACTION = 0.001;      // 0.1% of frame — allows distant phones

// Temporal smoothing: phone must be absent for this many consecutive checks
// before clearing the detection. Prevents flickering when confidence dips briefly.
const CLEAR_AFTER_MISSES = 3;

function isPhoneSized(
  bbox: [number, number, number, number],
  video: HTMLVideoElement
): boolean {
  const frameArea = video.videoWidth * video.videoHeight;
  const [, , w, h] = bbox;
  return (w * h) / frameArea >= MIN_AREA_FRACTION;
}

export function usePhoneDetection(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const missCountRef = useRef(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [phoneState, setPhoneState] = useState<PhoneState>("none");

  useEffect(() => {
    let cancelled = false;
    cocoSsd.load().then((model) => {
      if (!cancelled) {
        modelRef.current = model;
        setIsModelLoaded(true);
      }
    }).catch((err) => console.error("COCO-SSD load failed:", err));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isModelLoaded) return;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      const model = modelRef.current;
      if (!video || !model || video.readyState < 2 || video.paused) return;

      const predictions = await model.detect(video);

      const phoneFound = predictions.some((p) => {
        if (!isPhoneSized(p.bbox, video)) return false;
        if (p.class === "cell phone" && p.score >= PHONE_FRONT_THRESHOLD) return true;
        if (p.class === "remote" && p.score >= REMOTE_PROXY_THRESHOLD) return true;
        return false;
      });

      if (phoneFound) {
        missCountRef.current = 0;
        setPhoneState("detected");
      } else {
        missCountRef.current += 1;
        if (missCountRef.current >= CLEAR_AFTER_MISSES) {
          setPhoneState("none");
        }
      }
    }, DETECTION_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [isModelLoaded, videoRef]);

  return { phoneState, isModelLoaded };
}