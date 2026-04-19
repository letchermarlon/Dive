// Combines gaze + phone signals into a single FocusStatus
// This is the one hook session components will import

import { useEffect, useRef } from "react";
import { useCamera } from "./useCamera";
import { useGazeDetection, type GazeResult } from "./useGazeDetection";
import { usePhoneDetection } from "./usePhoneDetection";
import { useAlertSound } from "./useAlertSound";

export type FocusStatus = "focused" | "looking-away" | "phone-detected" | "no-face" | "camera-off";

export type FocusMonitorResult = {
  status: FocusStatus;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startCamera: () => void;
  stopCamera: () => void;
  cameraStatus: ReturnType<typeof useCamera>["status"];
  gazeResult: GazeResult;
  isGazeModelLoaded: boolean;
  isPhoneModelLoaded: boolean;
  gazeHasError: boolean;
};

const GRACE_MS = 4000; // suppress detection for 4s after camera starts (model warm-up)

export function useFocusMonitor(): FocusMonitorResult {
  const { videoRef, status: cameraStatus, start, stop } = useCamera();
  const { gazeResult, isModelLoaded: isGazeModelLoaded, hasError: gazeHasError } = useGazeDetection(videoRef);
  const { phoneState, isModelLoaded: isPhoneModelLoaded } = usePhoneDetection(videoRef);
  const { playAlert } = useAlertSound();
  const prevStatusRef = useRef<FocusStatus>("camera-off");
  const cameraActiveAtRef = useRef<number>(0);

  if (cameraStatus === "active" && cameraActiveAtRef.current === 0) {
    cameraActiveAtRef.current = Date.now();
  } else if (cameraStatus !== "active") {
    cameraActiveAtRef.current = 0;
  }

  const inGrace = cameraActiveAtRef.current > 0 && Date.now() - cameraActiveAtRef.current < GRACE_MS;

  let status: FocusStatus = "camera-off";
  if (cameraStatus === "active") {
    if (inGrace) {
      status = "focused";
    } else if (phoneState === "detected") {
      status = "phone-detected";
    } else if (!gazeHasError && gazeResult.state === "no-face") {
      status = "no-face";
    } else if (!gazeHasError && gazeResult.state === "looking-away") {
      status = "looking-away";
    } else {
      status = "focused";
    }
  }

  // Play chime when entering a distracted state
  useEffect(() => {
    const wasDistracted = prevStatusRef.current === "looking-away" || prevStatusRef.current === "phone-detected";
    const isDistracted = status === "looking-away" || status === "phone-detected";
    if (isDistracted && !wasDistracted) playAlert();
    prevStatusRef.current = status;
  }, [status, playAlert]);

  return { status, videoRef, startCamera: start, stopCamera: stop, cameraStatus, gazeResult, isGazeModelLoaded, isPhoneModelLoaded, gazeHasError };
}