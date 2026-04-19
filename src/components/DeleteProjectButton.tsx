"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 py-2 rounded-lg text-sm font-medium w-full"
          style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
        >
          {loading ? "Deleting..." : "Confirm delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: 'rgba(15,76,117,0.25)', border: '1px solid rgba(187,225,250,0.12)', color: '#bbe1fa' }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full text-center py-2 rounded-lg text-sm font-medium transition-colors"
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
    >
      Delete
    </button>
  );
}