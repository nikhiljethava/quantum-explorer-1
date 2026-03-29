"""Workload normalization and completeness checks."""

from typing import List

from hybrid_quantum_workload_navigator_agents import NormalizedWorkload

from app.models import Workload


REQUIRED_FIELDS = [
    "business_objective",
    "current_baseline",
    "current_bottleneck",
    "problem_family",
    "representation",
    "time_horizon",
]


def refresh_workload_completeness(workload: Workload) -> Workload:
    """Compute completeness metadata in-place."""

    missing = []
    for field_name in REQUIRED_FIELDS:
        value = getattr(workload, field_name, "")
        if not value or not str(value).strip():
            missing.append(field_name)

    workload.missing_fields = missing
    workload.completeness_score = round((len(REQUIRED_FIELDS) - len(missing)) / len(REQUIRED_FIELDS), 2)
    workload.status = "ready" if not missing else "draft"
    return workload


def normalize_workload(workload: Workload) -> NormalizedWorkload:
    """Map a persisted workload into the shared agent contract."""

    notes: List[str] = []
    if workload.sample_lane:
        notes.append("Sample lane: " + workload.sample_lane)

    return NormalizedWorkload(
        workload_id=workload.id,
        title=workload.title,
        project_id=workload.project_id,
        domain=workload.domain,
        problem_family=workload.problem_family,
        representation=workload.representation,
        business_objective=workload.business_objective,
        current_baseline=workload.current_baseline,
        current_bottleneck=workload.current_bottleneck,
        time_horizon=workload.time_horizon,
        validation_needs=workload.validation_needs,
        success_metric=workload.success_metric,
        constraint_profile=workload.constraint_profile or {},
        notes=notes,
    )
