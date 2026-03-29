"""Deterministic workload assessment service."""

from dataclasses import dataclass
from typing import Dict, List

from app.models import Workload


@dataclass
class AssessmentSnapshot:
    disposition: str
    confidence_band: str
    summary: str
    score_breakdown: Dict[str, int]
    rationale: List[str]
    assumptions: List[str]
    change_drivers: List[str]


def _contains_any(text: str, terms: List[str]) -> bool:
    lowered = text.lower()
    return any(term in lowered for term in terms)


def _score_classical_baseline(workload: Workload) -> int:
    bottleneck = workload.current_bottleneck.lower()
    baseline = workload.current_baseline.lower()
    if _contains_any(bottleneck, ["data quality", "integration", "ux", "adoption"]):
        return -2
    if _contains_any(bottleneck, ["slow", "expensive", "manual", "scaling", "intractable"]):
        return 1
    if _contains_any(baseline, ["strong", "adequate", "works well", "mature"]):
        return -1
    return 0


def _score_problem_structure(workload: Workload) -> int:
    family = workload.problem_family.lower()
    if family in {"chemistry_materials", "molecule_simulation", "portfolio_optimization", "routing_optimization"}:
        return 2
    if _contains_any(family, ["optimization", "chemistry", "materials", "graph"]):
        return 1
    if _contains_any(family, ["text", "image", "analytics"]):
        return -1
    return 0


def _score_representation_fit(workload: Workload) -> int:
    representation = workload.representation.lower()
    if representation in {"molecule", "hamiltonian", "graph", "lattice"}:
        return 2
    if representation in {"circuit", "qubo", "portfolio"}:
        return 1
    if representation in {"tabular", "text", "image", "other"}:
        return -1
    return 0


def _score_time_horizon(workload: Workload) -> int:
    horizon = workload.time_horizon.lower()
    if horizon in {"production_now", "immediate_roi"}:
        return -2
    if horizon in {"prototype_now", "research_pilot"}:
        return 1
    if horizon in {"fault_tolerant_later", "later_strategy"}:
        return 2
    return 0


def _score_verification(workload: Workload) -> int:
    validation = workload.validation_needs.lower()
    if _contains_any(validation, ["regulated", "production-grade", "strict"]):
        return -2
    if _contains_any(validation, ["explainable", "credible", "auditable"]):
        return -1
    if _contains_any(validation, ["prototype", "demo", "exploratory"]):
        return 1
    if _contains_any(validation, ["research"]):
        return 2
    return 0


def _score_team_readiness(workload: Workload) -> int:
    text = " ".join([workload.success_metric, workload.business_objective]).lower()
    if _contains_any(text, ["training", "teaching", "learn"]):
        return -1
    if _contains_any(text, ["prototype", "inspect", "research", "technical"]):
        return 1
    return 0


def assess_workload(workload: Workload) -> AssessmentSnapshot:
    """Apply the deterministic rubric from the local docs."""

    missing = workload.missing_fields or []
    score_breakdown = {
        "classical_baseline_strength": _score_classical_baseline(workload),
        "problem_structure": _score_problem_structure(workload),
        "representation_fit": _score_representation_fit(workload),
        "time_horizon_fit": _score_time_horizon(workload),
        "verification_and_trust_tolerance": _score_verification(workload),
        "team_readiness": _score_team_readiness(workload),
    }

    if missing:
        return AssessmentSnapshot(
            disposition="education_only",
            confidence_band="low",
            summary="More intake detail is required before a qualification recommendation is credible.",
            score_breakdown=score_breakdown,
            rationale=[
                "Required intake fields are still missing.",
                "The current information does not isolate a narrow candidate subproblem.",
            ],
            assumptions=["Missing fields: " + ", ".join(missing)],
            change_drivers=["Complete the required intake fields to unlock a stronger recommendation."],
        )

    if _contains_any(workload.current_bottleneck, ["data quality", "integration", "ux"]) or _contains_any(
        workload.problem_family, ["text", "image", "analytics"]
    ):
        disposition = "classical_only"
    elif score_breakdown["problem_structure"] <= 0 or score_breakdown["representation_fit"] <= 0:
        disposition = "education_only"
    else:
        total = (
            2 * score_breakdown["classical_baseline_strength"]
            + 2 * score_breakdown["problem_structure"]
            + 2 * score_breakdown["representation_fit"]
            + score_breakdown["time_horizon_fit"]
            + score_breakdown["verification_and_trust_tolerance"]
            + score_breakdown["team_readiness"]
        )
        if total <= -4:
            disposition = "classical_only"
        elif total <= 2:
            disposition = "education_only"
        elif total <= 9:
            disposition = "hybrid_prototype_now"
        else:
            disposition = "fault_tolerant_candidate_later"

    zero_count = len([value for value in score_breakdown.values() if value == 0])
    confidence_band = "high" if zero_count == 0 else "medium"

    rationale = [
        "The recommendation isolates a narrow candidate quantum subproblem instead of treating the full workflow as quantum-native.",
        "Product state remains in the API and database while heavy prototype work stays asynchronous.",
    ]
    assumptions = [
        "This recommendation is not proof of quantum advantage.",
        "Any prototype path should remain simulator-based until capabilities and validation improve.",
    ]
    change_drivers = [
        "A stronger classical baseline or a weaker representation fit would move the result toward classical-only or education-only.",
        "Greater tolerance for future-state exploration could strengthen a later-stage recommendation.",
    ]

    summary_map = {
        "classical_only": "Stay on a classical path for now and treat quantum content as educational only.",
        "education_only": "The current workload is better suited to education and framing than to prototype generation.",
        "hybrid_prototype_now": "A hybrid prototype is reasonable now if the scope stays narrow and caveats stay explicit.",
        "fault_tolerant_candidate_later": "The workload shows a credible long-term fit, with a reduced-scale hybrid prototype as the immediate next step.",
    }

    return AssessmentSnapshot(
        disposition=disposition,
        confidence_band=confidence_band,
        summary=summary_map[disposition],
        score_breakdown=score_breakdown,
        rationale=rationale,
        assumptions=assumptions,
        change_drivers=change_drivers,
    )
