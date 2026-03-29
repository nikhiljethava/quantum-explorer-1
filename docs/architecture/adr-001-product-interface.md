# ADR 001: Product Interface Uses Next.js, Not ADK Web

## Status

Accepted

## Decision

The end-user product interface is a custom Next.js application. Google ADK is
used only for agent orchestration and local developer debugging through the
separate `agent_lab`.

## Rationale

- The product needs a stable, opinionated workflow UI.
- ADK Web is useful for agent debugging but should not define user experience.
- Keeping the product UI separate protects the API contract and deployment
  boundaries.
