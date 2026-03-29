"""Pydantic schemas for API contracts."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ConstraintProfile(BaseModel):
    accuracy: str = "medium"
    latency: str = "medium"
    cost: str = "medium"
    explainability: str = "high"


class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    domain: str = "mixed"


class ProjectRead(ORMModel):
    id: str
    name: str
    description: str
    domain: str
    status: str
    created_at: datetime
    updated_at: datetime


class WorkloadCreate(BaseModel):
    project_id: str
    title: str
    domain: str = "mixed"
    problem_family: str
    representation: str
    business_objective: str
    current_baseline: str
    current_bottleneck: str
    validation_needs: str = ""
    time_horizon: str
    success_metric: str = ""
    sample_lane: str = ""
    constraint_profile: ConstraintProfile = Field(default_factory=ConstraintProfile)


class WorkloadRead(ORMModel):
    id: str
    project_id: str
    title: str
    domain: str
    problem_family: str
    representation: str
    business_objective: str
    current_baseline: str
    current_bottleneck: str
    validation_needs: str
    time_horizon: str
    success_metric: str
    sample_lane: str
    constraint_profile: Dict[str, str]
    completeness_score: float
    missing_fields: List[str]
    status: str
    created_at: datetime
    updated_at: datetime


class AssessmentRead(ORMModel):
    id: str
    workload_id: str
    disposition: str
    confidence_band: str
    summary: str
    score_breakdown: Dict[str, int]
    rationale: List[str]
    assumptions: List[str]
    change_drivers: List[str]
    citations: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class LaneNode(BaseModel):
    label: str
    kind: str
    notes: str


class ArchitectureRead(ORMModel):
    id: str
    workload_id: str
    summary: str
    classical_lane: List[LaneNode]
    quantum_lane: List[LaneNode]
    verification_lane: List[LaneNode]
    citations: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class ExplanationRequest(BaseModel):
    mode: str = "exec"


class ExplanationRead(BaseModel):
    mode: str
    content: str
    citations: List[Dict[str, Any]]


class PrototypeJobCreate(BaseModel):
    job_type: str = "prototype_generate"
    template_key: str = "auto"
    execution_mode: str = "queued"


class JobRead(ORMModel):
    id: str
    workload_id: str
    job_type: str
    status: str
    progress: int
    request_payload: Dict[str, Any]
    result_summary: Dict[str, Any]
    error_message: Optional[str] = None
    correlation_id: str
    created_at: datetime
    updated_at: datetime


class ArtifactRead(ORMModel):
    id: str
    job_id: str
    workload_id: str
    kind: str
    status: str
    storage_path: str
    download_url: str
    metadata_json: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class ChatMessageCreate(BaseModel):
    content: str
    mode: str = "architect"


class ChatTurnRead(ORMModel):
    id: str
    thread_id: str
    role: str
    content: str
    citations: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class ChatExchangeRead(BaseModel):
    thread_id: str
    user_turn: ChatTurnRead
    assistant_turn: ChatTurnRead
