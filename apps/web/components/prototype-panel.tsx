"use client";

import { useEffect, useState } from "react";

type Artifact = {
  id: string;
  kind: string;
  label: string;
};

type PrototypePanelProps = {
  workloadId: string;
  job: {
    id: string;
    status: string;
    executionMode: string;
  };
  artifacts: Artifact[];
};

export function PrototypePanel({ workloadId, job, artifacts }: PrototypePanelProps) {
  const [status, setStatus] = useState(job.status);

  useEffect(() => {
    let cancelled = false;
    if (!job.id || status === "succeeded" || status === "failed") {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/jobs/${job.id}`
        );
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { status?: string };
        if (!cancelled && payload.status) {
          setStatus(payload.status);
        }
      } catch {
        // Keep the shell resilient when the API is not online yet.
      }
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [job.id, status]);

  return (
    <section className="prototype-card">
      <div className="prototype-header">
        <div>
          <p className="eyebrow">Prototype job</p>
          <h3>{workloadId}</h3>
        </div>
        <div className="status-pill">{status}</div>
      </div>
      <p className="muted-copy">
        Execution mode: {job.executionMode}. The API returns a job handle
        immediately and the worker owns long-running generation.
      </p>
      <div className="artifact-list">
        {artifacts.map((artifact) => (
          <div className="artifact-row" key={artifact.id}>
            <div>
              <p className="artifact-kind">{artifact.kind}</p>
              <strong>{artifact.label}</strong>
            </div>
            <button type="button">Queued view</button>
          </div>
        ))}
      </div>
    </section>
  );
}
