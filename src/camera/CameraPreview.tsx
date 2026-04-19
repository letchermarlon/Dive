"use client";

// Standalone test component — shows webcam feed + live focus status overlay
// Use this to develop/test detection in isolation before wiring into sessions

import { useFocusMonitor } from "./useFocusMonitor";

const STATUS_STYLES: Record<string, string> = {
  focused: "bg-green-500",
  "looking-away": "bg-yellow-500",
  "phone-detected": "bg-red-500",
  "no-face": "bg-gray-500",
  "camera-off": "bg-slate-700",
};

const STATUS_LABELS: Record<string, string> = {
  focused: "Focused",
  "looking-away": "Looking Away",
  "phone-detected": "Phone Detected",
  "no-face": "No Face",
  "camera-off": "Camera Off",
};

export function CameraPreview() {
  const { status, videoRef, startCamera, stopCamera, cameraStatus, gazeResult, isModelLoaded } = useFocusMonitor();

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="relative w-[640px] max-w-full aspect-video bg-black rounded-xl overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          playsInline
          muted
        />
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-semibold ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </div>

        {/* Debug overlay — yaw/pitch for threshold tuning */}
        {cameraStatus === "active" && (
          <div className="absolute bottom-3 left-3 text-xs text-white/70 font-mono space-y-0.5">
            <div>model: {isModelLoaded ? "ready" : "loading…"}</div>
            <div>yaw: {gazeResult.yaw.toFixed(1)}°</div>
            <div>pitch: {gazeResult.pitch.toFixed(1)}°</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={startCamera}
          disabled={cameraStatus === "active" || cameraStatus === "requesting"}
          className="px-4 py-2 bg-ocean-600 text-white rounded-lg disabled:opacity-40"
        >
          Start Camera
        </button>
        <button
          onClick={stopCamera}
          disabled={cameraStatus !== "active"}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg disabled:opacity-40"
        >
          Stop Camera
        </button>
      </div>

      {cameraStatus === "denied" && (
        <p className="text-red-400 text-sm">
          Camera permission denied. Allow access in browser settings.
        </p>
      )}
    </div>
  );
}