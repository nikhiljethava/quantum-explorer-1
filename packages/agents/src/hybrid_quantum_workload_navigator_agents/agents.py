"""Deterministic agent roles used by the root workflow."""

from pathlib import Path

from .contracts import (
    ArchitectureProposal,
    ExplanationPack,
    NormalizedWorkload,
    RetrievalResult,
    ScoutResult,
)
from .retrieval import LocalCorpusRetriever


class ScoutAgent:
    """Identify the narrow candidate subproblem and readiness posture."""

    def run(self, workload: NormalizedWorkload) -> ScoutResult:
        candidate = (
            "Reduced electronic-structure analysis"
            if "chem" in workload.problem_family or "molecule" in workload.representation
            else "Structured optimization subproblem"
        )
        readiness = (
            "prototype_only"
            if workload.time_horizon in {"prototype_now", "research_pilot"}
            else "later_stage"
        )
        return ScoutResult(
            candidate_subproblem=candidate,
            readiness_label=readiness,
            rationale=[
                "The full workflow should remain mostly classical.",
                "A narrow candidate subproblem is isolated before any quantum path is suggested.",
            ],
            assumptions=[
                "This path is simulation-first and not proof of quantum advantage.",
                "Real execution depends on adapter availability and validation needs.",
            ],
        )


class RetrievalAgent:
    """Retrieve supporting local references for the workload."""

    def __init__(self, corpus_root: Path) -> None:
        self.retriever = LocalCorpusRetriever(corpus_root)

    def run(self, workload: NormalizedWorkload, scout: ScoutResult) -> RetrievalResult:
        query_terms = [
            workload.problem_family,
            workload.representation,
            workload.domain,
            scout.candidate_subproblem,
        ]
        return self.retriever.retrieve(query_terms=query_terms)


class HybridArchitectAgent:
    """Build a human-readable classical and quantum split."""

    def run(
        self,
        workload: NormalizedWorkload,
        scout: ScoutResult,
        retrieval: RetrievalResult,
    ) -> ArchitectureProposal:
        references = ", ".join(hit.title for hit in retrieval.hits) or "local corpus guidance"
        return ArchitectureProposal(
            summary=(
                "Keep intake, ranking, and reporting in the classical lane while "
                "testing a narrow quantum candidate lane for "
                + scout.candidate_subproblem.lower()
                + "."
            ),
            classical_lane=[
                {
                    "label": "Normalize workload inputs",
                    "kind": "processing",
                    "notes": "FastAPI persists product state and prepares deterministic scoring.",
                },
                {
                    "label": "Run classical baseline and filter candidates",
                    "kind": "analysis",
                    "notes": "High-volume steps stay classical.",
                },
            ],
            quantum_lane=[
                {
                    "label": scout.candidate_subproblem,
                    "kind": "simulation",
                    "notes": "Use simulator-backed adapters with explicit capability checks.",
                }
            ],
            verification_lane=[
                {
                    "label": "Compare against baseline and cite references",
                    "kind": "validation",
                    "notes": "Support references from " + references + ".",
                }
            ],
        )


class ExplainerAgent:
    """Format the same result for different audiences."""

    def run(
        self,
        workload: NormalizedWorkload,
        scout: ScoutResult,
        architecture: ArchitectureProposal,
    ) -> ExplanationPack:
        del workload
        exec_summary = (
            "This workload has a narrow quantum candidate, but the recommended "
            "path is a controlled hybrid prototype with explicit caveats."
        )
        architect_summary = (
            "Persist product state in the API, queue long-running prototype work, "
            "and keep the candidate quantum lane isolated behind adapters."
        )
        scientist_summary = (
            "The suggested experiment focuses on "
            + scout.candidate_subproblem.lower()
            + " while preserving classical verification and reproducibility."
        )
        return ExplanationPack(
            exec_summary=exec_summary,
            architect_summary=architect_summary + " " + architecture.summary,
            scientist_summary=scientist_summary,
        )
