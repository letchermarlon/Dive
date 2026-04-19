// Hook: detect if a phone/cell phone appears in the video frame
// Uses @tensorflow-models/coco-ssd (COCO object detection, runs in-browser)
// COCO class "cell phone" covers most modern smartphones

export type PhoneState = "none" | "detected";

// TODO: implement with @tensorflow-models/coco-ssd
// Rough plan:
//   1. Load cocoSsd.load() once on mount
//   2. On each animation frame, run model.detect(videoEl)
//   3. Filter predictions for class "cell phone" with score > 0.5
//   4. Return "detected" if any match, "none" otherwise

export function usePhoneDetection(_videoRef: React.RefObject<HTMLVideoElement | null>) {
  // Stub — returns none until model is wired in
  return {
    phoneState: "none" as PhoneState,
    isModelLoaded: false,
  };
}