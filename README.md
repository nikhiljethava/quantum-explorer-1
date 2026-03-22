# Quantum Explorer

Quantum Explorer is a beginner-first web app that helps business users
understand when a problem should stay classical, when a small hybrid pilot may
be worth exploring, and when quantum is more of a long-term opportunity.

## What the app includes

- A short guided questionnaire
- One plain-English recommendation
- Simple explanation of why that answer was chosen
- Beginner-friendly examples and glossary

## Product direction

The current live app is intentionally simple and aimed at non-technical users.
The repository also includes a deeper engineering package for a future version
of the product:

- [Local MVP blueprint](docs/local-mvp-blueprint.md)
- [API and data model](docs/api-and-data-model.md)
- [Fit-assessment rubric](docs/fit-assessment-rubric.md)
- [Build plan](docs/build-plan.md)

## Run locally

This app has no build step.

1. Open `/Users/nikhiljethava/Documents/Codex/index.html` in a browser.

## Product framing

The app is intentionally opinionated:

- Quantum is not treated as a general-purpose faster computer
- Most business workflows should remain classical
- A small hybrid pilot is usually more realistic than a full quantum story
- The product explains, rather than oversells, where quantum may matter

## Good next steps

- Keep improving the beginner experience and wording
- Add a dedicated advanced mode later for technical users
- Reshape the repo into `apps/web` and `apps/api` when the simplified UX is stable
- Implement the future API and rubric from `docs/` after the product flow is validated
