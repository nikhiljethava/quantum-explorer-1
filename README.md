# Hybrid Quantum Workload Navigator

Hybrid Quantum Workload Navigator is a local-first, cloud-ready monorepo for
assessing candidate workloads, proposing hybrid classical/quantum decompositions,
explaining the tradeoffs for different audiences, and generating prototype
artifacts through a background worker.

The product interface is a custom Next.js web app. Google ADK is reserved for
agent orchestration and the optional local-only `agent_lab`.

## Repository layout

```text
.
├── apps
│   ├── agent_lab
│   ├── api
│   └── web
├── archive
│   └── playground
├── data
│   └── artifacts
├── docs
│   ├── architecture
│   └── corpus
├── infra
│   └── terraform
└── packages
    └── agents
```

## Local run with Docker Compose

1. Copy the environment template.

```bash
cp .env.example .env
```

2. Start the full local stack.

```bash
./scripts/docker compose up --build
```

3. Open the product UI at [http://localhost:3000](http://localhost:3000).

4. Open the API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

If you already have global Docker CLI symlinks on your machine, plain
`docker compose up --build` works too. The bundled wrappers under `scripts/`
exist so this repo stays runnable even when Docker Desktop is installed without
privileged CLI linking.

## Manual local run

### API

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e packages/agents -e apps/api
PYTHONPATH=apps/api:packages/agents/src \
uvicorn app.main:app --app-dir apps/api --reload --port 8000
```

### Worker

```bash
source .venv/bin/activate
PYTHONPATH=apps/api:packages/agents/src \
python3 -m app.worker.main --once
```

### Web

```bash
cd apps/web
npm install
npm run dev
```

## Sample flows

- Battery materials screening
- Molecule simulation and chemistry planning
- Portfolio and routing optimization

The API seeds sample projects and workloads on startup so the UI can show an
immediate happy path.

## Agent debugging

The product UI does not use ADK Web. For local debugging only:

```bash
source .venv/bin/activate
pip install google-adk
PYTHONPATH=packages/agents/src python3 apps/agent_lab/main.py
adk web
```

`apps/agent_lab` points at the same shared agent package used by the API.

## Current stage

This repository currently covers the initial scaffold requested by the
instruction pack:

- monorepo structure
- FastAPI backend shell
- separate worker process shell
- shared agent package with typed contracts
- Next.js frontend shell
- local corpus retrieval abstraction
- filesystem artifact storage abstraction
- seeded demo workloads
- first end-to-end happy-path test scaffold

## Known limitations in this scaffold

- Google ADK integration is optional and guarded because the dependency is not
  assumed to be installed everywhere.
- qsim, Cirq, OpenFermion, and Qualtran adapters are scaffolded with explicit
  capability checks and toy fallback metadata rather than full execution.
- The machine used for this scaffold does not currently have Python web
  dependencies or Node installed, so the code is structured and documented but
  not fully executed here end to end.
