# Hybrid Quantum Workload Navigator

## Build plan

This is the recommended milestone order for the local MVP.

## Delivery target

Reach a local, testable MVP before any GCP deployment work.

## Phase 0: repo reshape

Duration: `1-2 days`

### Outcome

Convert the current static prototype repo into a structure that can support a
real app.

### Tasks

- create `apps/web` and `apps/api`
- keep the current static prototype under `archive/` or convert it into design
  reference assets
- add `.env.example`
- add `docker-compose.yml` for Postgres
- add root scripts and a short contributor README

### Exit criteria

- repo installs locally
- web and api apps boot independently
- Postgres starts locally

## Phase 1: intake and persistence

Duration: `3-4 days`

### Outcome

Users can create sessions, enter workload details, and save progress.

### Backend tasks

- implement `sessions` and `scenarios` tables
- create `POST /sessions`
- create `PUT /sessions/{id}/scenario`
- create completeness-check service
- add seed data for materials and optimization scenarios

### Frontend tasks

- dashboard page
- new-session flow
- guided-intake form
- completeness meter
- executive and builder mode toggle

### Exit criteria

- a user can create, edit, and reload a scenario locally

## Phase 2: fit assessment

Duration: `3-4 days`

### Outcome

The app can produce a deterministic disposition with rationale.

### Tasks

- implement rubric from `docs/fit-assessment-rubric.md`
- create assessment persistence
- build fit report UI
- render assumptions, confidence, and change drivers
- add unit tests for at least 12 scenario fixtures

### Exit criteria

- three flagship scenarios work:
  battery materials, delivery optimization, fraud detection

## Phase 3: hybrid canvas

Duration: `4-5 days`

### Outcome

The app can show and edit a classical/quantum split.

### Tasks

- create workflow-graph generator service
- create canvas data model
- build editable swimlane UI
- persist graph edits
- add readiness tags and notes

### Exit criteria

- a user can generate a split, edit nodes, save, and export the graph JSON

## Phase 4: prototype builder

Duration: `5-6 days`

### Outcome

The app can generate trusted starter artifacts.

### Initial templates

- `chemistry_openfermion_v1`
- `optimization_qaoa_v1`
- `architecture_summary_v1`

### Tasks

- build Jinja template system
- generate notebook or markdown artifacts
- add job runner and status polling
- store artifacts on local disk
- surface artifact preview and downloads in the UI

### Exit criteria

- one chemistry prototype and one optimization prototype can be generated locally

## Phase 5: future-state estimate and exports

Duration: `3-4 days`

### Outcome

The app can package a full session for follow-up.

### Tasks

- create lightweight resource-estimate service
- add estimate screen with caveats
- implement export bundle generation
- generate markdown executive brief
- generate JSON session export

### Exit criteria

- a complete session produces a brief, graph data, and prototype artifacts

## Phase 6: polish and validation

Duration: `3-5 days`

### Outcome

The MVP is stable enough for internal demo and design review.

### Tasks

- add empty states and error handling
- add fixture-driven demo sessions
- tighten language for trust and caveats
- test executive vs builder mode
- confirm output matches PRD terminology

### Exit criteria

- run one full materials demo and one optimization demo end to end

## MVP acceptance checklist

- session can be created and revisited
- assessment is deterministic and auditable
- hybrid split is visible and editable
- prototype generation is template-based
- exports preserve caveats
- app runs locally without GCP dependencies

## What not to build yet

- customer auth
- direct Google Cloud integration
- real Vertex/Gemini dependency
- real Qualtran execution
- large-scale simulation orchestration
- multi-user collaboration
- permissions and admin console

## First cloud migration path

Once the local MVP is validated:

1. move Postgres to Cloud SQL
2. move artifact storage to Cloud Storage
3. deploy web and api to Cloud Run
4. move job execution to Cloud Run Jobs or a queue-backed worker
5. add Identity-Aware Proxy or Identity Platform only when needed
