// Combines gaze + phone signals into a single FocusStatus
// This is the one hook session components will import

import { useCamera } from "./useCamera";
import { useGazeDetection, type GazeResult } from "./useGazeDetection";
import { usePhoneDetection } from "./usePhoneDetection";

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
};

export function useFocusMonitor(): FocusMonitorResult {
  const { videoRef, status: cameraStatus, start, stop } = useCamera();
  const { gazeResult, isModelLoaded: isGazeModelLoaded } = useGazeDetection(videoRef);
  const { phoneState, isModelLoaded: isPhoneModelLoaded } = usePhoneDetection(videoRef);

  let status: FocusStatus = "camera-off";
  if (cameraStatus === "active") {
    if (phoneState === "detected") status = "phone-detected";
    else if (gazeResult.state === "no-face") status = "no-face";
    else if (gazeResult.state === "looking-away") status = "looking-away";
    else status = "focused";
  }

  return { status, videoRef, startCamera: start, stopCamera: stop, cameraStatus, gazeResult, isGazeModelLoaded, isPhoneModelLoaded };
}