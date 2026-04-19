// Temporary dev-only page for testing camera focus detection in isolation
// Route: /camera-test  — remove this page before merging to main

import { CameraPreview } from "@/camera/CameraPreview";

export default function CameraTestPage() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <h1 className="text-white text-2xl font-bold mb-6">Camera Focus Test</h1>
      <CameraPreview />
    </main>
  );
}