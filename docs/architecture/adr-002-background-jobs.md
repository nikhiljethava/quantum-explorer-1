# ADR 002: Long-Running Work Happens in a Worker

## Status

Accepted

## Decision

Prototype generation, resource estimates, and artifact bundling run through a
background worker that polls queued jobs from the database.

## Rationale

- Request handlers stay responsive.
- Job state transitions are explicit and inspectable.
- The model maps cleanly to Cloud Tasks plus worker handlers later.
