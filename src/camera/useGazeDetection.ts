// Hook: run face landmark detection on a video element, classify gaze state
// Uses @mediapipe/tasks-vision FaceLandmarker (runs in-browser, no server needed)
// Returns: "focused" | "looking-away" | "no-face"

export type GazeState = "focused" | "looking-away" | "no-face";

// TODO: implement with @mediapipe/tasks-vision
// Rough plan:
//   1. Load FaceLandmarker model (wasm from CDN or local)
//   2. On each animation frame, run detectForVideo(videoEl, timestamp)
//   3. From face landmarks, compute head yaw/pitch (nose tip vs ear positions)
//   4. Classify: yaw > ~25deg or pitch > ~20deg = looking-away, no landmarks = no-face
//   5. Return current GazeState + raw angle values for debugging

export type GazeResult = {
  state: GazeState;
  yaw: number;   // degrees, positive = turned right
  pitch: number; // degrees, positive = tilted up
};

export function useGazeDetection(_videoRef: React.RefObject<HTMLVideoElement | null>) {
  // Stub — returns focused until model is wired in
  return {
    gazeResult: { state: "focused" as GazeState, yaw: 0, pitch: 0 },
    isModelLoaded: false,
  };
}