# Architecture Overview

Hybrid Quantum Workload Navigator is a modular monolith with explicit boundaries
for the product API, background work, agent orchestration, retrieval, and
artifact storage.

## Runtime boundaries

- `apps/web`: product UI in Next.js and TypeScript
- `apps/api`: FastAPI product API and persistence layer
- `apps/api/app/worker`: separate Python worker process for long-running jobs
- `packages/agents`: shared typed workflow contracts and agent orchestration
- `docs/corpus`: local retrieval corpus for the first version
- `data/artifacts`: local filesystem artifact storage through an abstraction

## Guardrails

- ADK Web is not the product interface.
- Product state lives in PostgreSQL-compatible tables, not only in agent memory.
- Long-running prototype generation stays in the worker path.
- Retrieval is isolated behind a corpus abstraction so it can later map to
  Vertex AI Search.
- Artifact persistence is isolated behind a storage interface so it can later
  map to Google Cloud Storage.
