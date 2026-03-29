"""Typed contracts shared across the deterministic agent workflow."""

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class NormalizedWorkload:
    workload_id: str
    title: str
    project_id: str
    domain: str
    problem_family: str
    representation: str
    business_objective: str
    current_baseline: str
    current_bottleneck: str
    time_horizon: str
    validation_needs: str
    success_metric: str
    constraint_profile: Dict[str, str]
    notes: List[str] = field(default_factory=list)


@dataclass
class ScoutResult:
    candidate_subproblem: str
    readiness_label: str
    rationale: List[str]
    assumptions: List[str]


@dataclass
class RetrievalHit:
    source_id: str
    title: str
    excerpt: str
    score: int


@dataclass
class RetrievalResult:
    query_terms: List[str]
    hits: List[RetrievalHit]


@dataclass
class ArchitectureProposal:
    summary: str
    classical_lane: List[Dict[str, str]]
    quantum_lane: List[Dict[str, str]]
    verification_lane: List[Dict[str, str]]


@dataclass
class ExplanationPack:
    exec_summary: str
    architect_summary: str
    scientist_summary: str


@dataclass
class WorkflowResult:
    scout: ScoutResult
    retrieval: RetrievalResult
    architecture: ArchitectureProposal
    explanations: ExplanationPack
