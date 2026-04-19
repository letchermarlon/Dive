"use client";

import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export type GazeState = "focused" | "looking-away" | "no-face";

export type GazeResult = {
  state: GazeState;
  yaw: number;   // degrees, positive = turned right
  pitch: number; // degrees, positive = tilted down
};

// Thresholds — tune these after testing
const YAW_THRESHOLD = 25;    // degrees left/right before "looking-away"
const PITCH_UP_THRESHOLD = -18;   // degrees (negative = looking up)
const PITCH_DOWN_THRESHOLD = 22;  // degrees (positive = looking down)

// MediaPipe landmark indices (out of 478 total)
const NOSE_TIP = 1;
const LEFT_TEMPLE = 234;
const RIGHT_TEMPLE = 454;
const FOREHEAD = 10;
const CHIN = 152;

type Landmark = { x: number; y: number; z: number };

function computeHeadPose(lm: Landmark[]): { yaw: number; pitch: number } {
  const nose = lm[NOSE_TIP];
  const leftT = lm[LEFT_TEMPLE];
  const rightT = lm[RIGHT_TEMPLE];
  const forehead = lm[FOREHEAD];
  const chin = lm[CHIN];

  // Yaw: where is nose between left and right temples?
  // 0.5 = straight, >0.5 = turned right, <0.5 = turned left
  const yawRatio = (nose.x - leftT.x) / (rightT.x - leftT.x);
  const yaw = (yawRatio - 0.5) * 90;

  // Pitch: where is nose between forehead and chin?
  // ~0.45 = straight, lower = looking up, higher = looking down
  const pitchRatio = (nose.y - forehead.y) / (chin.y - forehead.y);
  const pitch = (pitchRatio - 0.48) * 70;

  return { yaw, pitch };
}

export function useGazeDetection(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [gazeResult, setGazeResult] = useState<GazeResult>({
    state: "no-face",
    yaw: 0,
    pitch: 0,
  });

  // Load model once on mount
  useEffect(() => {
    let cancelled = false;
    async function loadModel() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
      if (!cancelled) {
        landmarkerRef.current = landmarker;
        setIsModelLoaded(true);
      }
    }
    loadModel().catch((err) => console.error("FaceLandmarker load failed:", err));
    return () => { cancelled = true; };
  }, []);

  // Detection loop — runs every animation frame when model + video are ready
  useEffect(() => {
    if (!isModelLoaded) return;

    function detect() {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (video && landmarker && video.readyState >= 2 && !video.paused) {
        const results = landmarker.detectForVideo(video, performance.now());
        const face = results.faceLandmarks?.[0];

        if (!face || face.length === 0) {
          setGazeResult({ state: "no-face", yaw: 0, pitch: 0 });
        } else {
          const { yaw, pitch } = computeHeadPose(face as Landmark[]);
          let state: GazeState = "focused";
          if (
            Math.abs(yaw) > YAW_THRESHOLD ||
            pitch < PITCH_UP_THRESHOLD ||
            pitch > PITCH_DOWN_THRESHOLD
          ) {
            state = "looking-away";
          }
          setGazeResult({ state, yaw, pitch });
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    }

    rafRef.current = requestAnimationFrame(detect);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isModelLoaded, videoRef]);

  return { gazeResult, isModelLoaded };
}