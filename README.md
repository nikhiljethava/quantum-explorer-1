# Quantum Explorer Playground

Quantum Explorer Playground is a beginner-first web app that helps non-technical
users learn core quantum ideas visually, try simple circuits in the browser,
and see a Google-style path toward tools like Cirq, qsim, and OpenFermion.

## What the app includes

- Beginner-friendly use-case examples
- Basic quantum operators explained in plain language
- A visual 2-qubit circuit editor
- Interactive circuit examples like superposition and Bell state
- Probability bars for circuit output
- A Cirq code preview tied to the visual editor

## Product direction

The live app is intentionally beginner-first. It borrows inspiration from:

- Black Opal style onboarding
- IBM Composer style visual circuits
- Quirk style immediate browser interaction
- Microsoft style browser playground

This repository also includes a deeper engineering package for a future version
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
- Learning should start visually, not with code
- The app uses a small number of operators first, then reveals more depth later
- Google's toolchain is the next step after intuition, not the starting point

## Good next steps

- Keep improving the beginner learning flow and visual explanations
- Add a stronger inspect mode and more example circuits
- Add a dedicated advanced mode later for technical users
- Reshape the repo into `apps/web` and `apps/api` when the playground UX is stable
