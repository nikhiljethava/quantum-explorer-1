import { demoProjects, demoWorkloads, type DemoWorkload, type ProjectSummary } from "./sample-data";

const serverBaseUrl =
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

type ApiProject = {
  id: string;
  name: string;
  description: string;
  domain: string;
};

type ApiWorkloadAssessment = {
  disposition: string;
  confidence_band: string;
  summary: string;
  rationale: string[];
  assumptions: string[];
  change_drivers: string[];
};

type ApiArchitecture = {
  summary: string;
  classical_lane: DemoWorkload["architecture"]["classicalLane"];
  quantum_lane: DemoWorkload["architecture"]["quantumLane"];
  verification_lane: DemoWorkload["architecture"]["verificationLane"];
};

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${serverBaseUrl}${path}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const projects = await apiFetch<ApiProject[]>("/api/projects");
  if (!projects) {
    return demoProjects;
  }
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    domain: project.domain
  }));
}

export async function getWorkloadDetails(id: string): Promise<DemoWorkload> {
  const demoWorkload = demoWorkloads.find((item) => item.id === id) ?? demoWorkloads[0];
  const assessment = await apiFetch<ApiWorkloadAssessment>(`/api/workloads/${id}/assess`);
  const architecture = await apiFetch<ApiArchitecture>(`/api/workloads/${id}/architecture`);

  if (!assessment || !architecture) {
    return demoWorkload;
  }

  return {
    ...demoWorkload,
    id,
    assessment: {
      disposition: assessment.disposition,
      confidenceBand: assessment.confidence_band,
      summary: assessment.summary,
      rationale: assessment.rationale,
      assumptions: assessment.assumptions,
      changeDrivers: assessment.change_drivers
    },
    architecture: {
      summary: architecture.summary,
      classicalLane: architecture.classical_lane,
      quantumLane: architecture.quantum_lane,
      verificationLane: architecture.verification_lane
    }
  };
}

export type JobStatus = {
  id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  artifacts?: Record<string, any>;
  error_message?: string;
};

export async function submitPrototypeJob(workloadId: string, jobType: string): Promise<JobStatus | null> {
  try {
    const response = await fetch(`${serverBaseUrl}/api/workloads/${workloadId}/prototype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_type: jobType, constraints: {} })
    });
    if (!response.ok) return null;
    return await response.json() as JobStatus;
  } catch {
    return null;
  }
}

export async function pollJobStatus(jobId: string): Promise<JobStatus | null> {
  return await apiFetch<JobStatus>(`/api/jobs/${jobId}`);
}

