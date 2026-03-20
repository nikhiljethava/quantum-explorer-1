# Quantum Fit Explorer

Quantum Fit Explorer is a lightweight MVP that helps a novice user understand
when to use classical computing, hybrid approaches, or quantum computing.

This repository now also contains a build-ready engineering package for the
next version of the app: the `Hybrid Quantum Workload Navigator`.

## What this prototype includes

- Guided assessment for a problem statement
- Explainable scoring across classical, hybrid, and quantum fit
- Example scenarios that teach the nuance
- Beginner glossary for key concepts

## Build-ready docs

- [Local MVP blueprint](docs/local-mvp-blueprint.md)
- [API and data model](docs/api-and-data-model.md)
- [Fit-assessment rubric](docs/fit-assessment-rubric.md)
- [Build plan](docs/build-plan.md)

These documents translate the PRD, user guide, and architecture notes into:

- concrete local architecture choices
- API contracts and persistence model
- deterministic recommendation logic
- milestone order for a local MVP before any GCP work

## Run locally

This app has no build step.

1. Open `/Users/nikhiljethava/Documents/Codex/index.html` in a browser.

## Product framing

The app is intentionally opinionated:

- Quantum is not treated as a general-purpose faster computer
- Classical baselines are required before recommending quantum exploration
- Hybrid workflows are presented as the most realistic bridge for many teams

## Good next steps

- Reshape the repo into `apps/web` and `apps/api`
- Implement the API and rubric from `docs/`
- Build the local MVP before adding GCP infrastructure
- Add LLM-assisted explanations only after deterministic flows are stable
- Add expert-reviewed benchmark scenarios for evaluation
