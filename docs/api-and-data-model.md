# Hybrid Quantum Workload Navigator

## API and data model

This is the implementation contract for the local MVP.

## API conventions

- Base path: `/api/v1`
- Payload format: `application/json`
- Long-running tasks return `202 Accepted` plus a `job_id`
- Artifact downloads are returned as URLs relative to the API host

## Core entities

### `Session`

Represents one user workspace for a workload conversation.

```json
{
  "id": "ses_123",
  "title": "Battery electrolyte screening",
  "persona": "r_and_d_lead",
  "mode": "executive",
  "primary_goal": "fit_assessment",
  "secondary_goal": "prototype_artifacts",
  "status": "active",
  "created_at": "2026-03-20T22:00:00Z",
  "updated_at": "2026-03-20T22:15:00Z"
}
```

### `Scenario`

Normalized intake object for the workload.

```json
{
  "id": "scn_123",
  "session_id": "ses_123",
  "industry": "materials",
  "problem_family": "chemistry_materials",
  "representation": "molecule",
  "business_objective": "Improve selection of promising electrolyte candidates.",
  "current_baseline": "Classical DFT pipeline plus screening heuristics.",
  "current_bottleneck": "Electronic-structure calculations are slow for selected subsets.",
  "validation_needs": "Scientifically credible and explainable results.",
  "time_horizon": "prototype_now",
  "success_metric": "Reduce exploratory screening cost and clarify future quantum value.",
  "constraint_profile": {
    "accuracy": "high",
    "latency": "medium",
    "cost": "medium",
    "explainability": "high"
  },
  "completeness_score": 0.89,
  "missing_fields": []
}
```

### `Assessment`

Deterministic recommendation output.

```json
{
  "id": "asm_123",
  "session_id": "ses_123",
  "scenario_id": "scn_123",
  "disposition": "hybrid_prototype_now",
  "confidence_band": "medium",
  "score_breakdown": {
    "classical_strength": -1,
    "problem_structure": 3,
    "representation_fit": 3,
    "horizon_fit": 2,
    "verification_risk": -1,
    "team_readiness": 1
  },
  "assumptions": [
    "The candidate quantum subproblem is a reduced active-space calculation.",
    "Most of the screening pipeline remains classical."
  ],
  "change_drivers": [
    "If the real bottleneck is data quality, the recommendation would move to classical-only.",
    "If larger accurate chemistry simulation is required, the later path becomes more important."
  ],
  "rationale": [
    "The workload contains a small, structured chemistry subproblem that is more promising than the full pipeline.",
    "Prototype work is credible only on a reduced example using simulators."
  ]
}
```

### `WorkflowGraph`

Editable decomposition canvas.

```json
{
  "id": "wfg_123",
  "session_id": "ses_123",
  "nodes": [
    {
      "id": "node_1",
      "lane": "classical",
      "label": "Data curation and candidate ranking",
      "kind": "processing",
      "readiness": "production_ready",
      "notes": "Remains classical."
    },
    {
      "id": "node_2",
      "lane": "quantum_candidate",
      "label": "Reduced electronic-structure subproblem",
      "kind": "simulation",
      "readiness": "prototype_only",
      "notes": "Use a toy active-space example."
    }
  ],
  "edges": [
    {
      "source": "node_1",
      "target": "node_2",
      "label": "Selected candidates"
    }
  ]
}
```

### `PrototypeRun`

Tracks notebook or artifact generation.

```json
{
  "id": "prt_123",
  "session_id": "ses_123",
  "template_key": "chemistry_openfermion_v1",
  "status": "completed",
  "job_id": "job_123",
  "parameters": {
    "example_scale": "toy",
    "target_runtime": "local_simulation"
  },
  "artifact_ids": ["art_1", "art_2"]
}
```

### `ResourceEstimate`

Stores future-state analysis metadata.

```json
{
  "id": "est_123",
  "session_id": "ses_123",
  "estimate_level": "directional",
  "hardware_horizon": "fault_tolerant_later",
  "inputs_summary": {
    "problem_family": "chemistry_materials",
    "representation": "molecule"
  },
  "assumptions": [
    "This estimate is educational and planning-oriented.",
    "Real resource requirements depend on algorithm choice and error correction assumptions."
  ],
  "result_summary": {
    "readiness": "later",
    "notes": "Useful scale depends on fault-tolerant systems."
  }
}
```

### `Artifact`

Generated output stored on disk.

```json
{
  "id": "art_123",
  "session_id": "ses_123",
  "kind": "markdown_brief",
  "status": "ready",
  "path": "data/artifacts/ses_123/executive-brief.md",
  "download_url": "/api/v1/artifacts/art_123/download"
}
```

### `Job`

Async task record.

```json
{
  "id": "job_123",
  "session_id": "ses_123",
  "job_type": "prototype_generation",
  "status": "completed",
  "progress": 100,
  "error_message": null
}
```

## REST endpoints

### Sessions

- `POST /sessions`
- `GET /sessions`
- `GET /sessions/{session_id}`
- `PATCH /sessions/{session_id}`
- `POST /sessions/{session_id}/clone`

### Scenario intake

- `PUT /sessions/{session_id}/scenario`
- `GET /sessions/{session_id}/scenario`
- `POST /sessions/{session_id}/scenario/complete-check`

### Fit assessment

- `POST /sessions/{session_id}/assessment/run`
- `GET /sessions/{session_id}/assessment`

`POST /sessions/{session_id}/assessment/run` request:

```json
{
  "rerun": true
}
```

Response:

```json
{
  "assessment_id": "asm_123",
  "disposition": "hybrid_prototype_now",
  "confidence_band": "medium"
}
```

### Workflow graph

- `POST /sessions/{session_id}/workflow-graph/generate`
- `GET /sessions/{session_id}/workflow-graph`
- `PUT /sessions/{session_id}/workflow-graph`

### Prototype generation

- `POST /sessions/{session_id}/prototype-runs`
- `GET /sessions/{session_id}/prototype-runs`
- `GET /prototype-runs/{prototype_run_id}`

Request:

```json
{
  "template_key": "chemistry_openfermion_v1",
  "parameters": {
    "example_scale": "toy",
    "target_runtime": "local_simulation"
  }
}
```

Response:

```json
{
  "prototype_run_id": "prt_123",
  "job_id": "job_123",
  "status": "queued"
}
```

### Resource estimate

- `POST /sessions/{session_id}/resource-estimates`
- `GET /sessions/{session_id}/resource-estimates/latest`

### Exports

- `POST /sessions/{session_id}/exports`
- `GET /sessions/{session_id}/exports`
- `GET /exports/{export_id}`

Request:

```json
{
  "include": [
    "executive_brief",
    "workflow_graph_json",
    "prototype_bundle"
  ]
}
```

### Jobs

- `GET /jobs/{job_id}`

## Database schema

### Tables

#### `sessions`

- `id` UUID PK
- `title` text
- `persona` text
- `mode` text
- `primary_goal` text
- `secondary_goal` text nullable
- `status` text
- `created_at` timestamptz
- `updated_at` timestamptz

#### `scenarios`

- `id` UUID PK
- `session_id` UUID FK unique
- `industry` text
- `problem_family` text
- `representation` text
- `business_objective` text
- `current_baseline` text
- `current_bottleneck` text
- `validation_needs` text
- `time_horizon` text
- `success_metric` text
- `constraint_profile` JSONB
- `extra_metadata` JSONB
- `completeness_score` numeric
- `missing_fields` JSONB
- `created_at` timestamptz
- `updated_at` timestamptz

#### `assessments`

- `id` UUID PK
- `session_id` UUID FK
- `scenario_id` UUID FK
- `disposition` text
- `confidence_band` text
- `score_breakdown` JSONB
- `assumptions` JSONB
- `change_drivers` JSONB
- `rationale` JSONB
- `created_at` timestamptz

#### `workflow_graphs`

- `id` UUID PK
- `session_id` UUID FK unique
- `nodes` JSONB
- `edges` JSONB
- `created_at` timestamptz
- `updated_at` timestamptz

#### `prototype_runs`

- `id` UUID PK
- `session_id` UUID FK
- `template_key` text
- `status` text
- `job_id` UUID FK nullable
- `parameters` JSONB
- `created_at` timestamptz
- `updated_at` timestamptz

#### `resource_estimates`

- `id` UUID PK
- `session_id` UUID FK
- `estimate_level` text
- `hardware_horizon` text
- `inputs_summary` JSONB
- `assumptions` JSONB
- `result_summary` JSONB
- `created_at` timestamptz

#### `artifacts`

- `id` UUID PK
- `session_id` UUID FK
- `kind` text
- `status` text
- `path` text
- `metadata` JSONB
- `created_at` timestamptz

#### `export_bundles`

- `id` UUID PK
- `session_id` UUID FK
- `status` text
- `artifact_ids` JSONB
- `created_at` timestamptz

#### `jobs`

- `id` UUID PK
- `session_id` UUID FK nullable
- `job_type` text
- `status` text
- `payload` JSONB
- `result` JSONB
- `progress` integer
- `error_message` text nullable
- `created_at` timestamptz
- `updated_at` timestamptz

## Acceptance notes

- Assessment results must be reproducible from stored scenario fields only.
- Prototype and export generation must not require an LLM.
- Every export must include caveat language tied to the final disposition.
