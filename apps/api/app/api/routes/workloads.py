"""Workload, assessment, architecture, explanation, and prototype routes."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_request_id, get_session
from app.core.config import Settings
from app.models import Assessment, HybridPlan, Job, Workload
from app.schemas import (
    ArchitectureRead,
    AssessmentRead,
    ExplanationRead,
    ExplanationRequest,
    JobRead,
    PrototypeJobCreate,
    WorkloadCreate,
    WorkloadRead,
)
from app.services.assessment import assess_workload
from app.services.intake import refresh_workload_completeness
from app.services.jobs import queue_job
from app.services.workflow import citations_from_workflow, run_shared_workflow
from app.services.explanations import select_explanation
from app.services.chat import ensure_chat_thread


router = APIRouter(prefix="/workloads", tags=["workloads"])


def _get_workload_or_404(db: Session, workload_id: str) -> Workload:
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(status_code=404, detail="Workload not found.")
    return workload


@router.post("", response_model=WorkloadRead, status_code=status.HTTP_201_CREATED)
def create_workload(payload: WorkloadCreate, db: Session = Depends(get_session)):
    """Create a workload and initialize its chat thread."""

    workload = Workload(
        project_id=payload.project_id,
        title=payload.title,
        domain=payload.domain,
        problem_family=payload.problem_family,
        representation=payload.representation,
        business_objective=payload.business_objective,
        current_baseline=payload.current_baseline,
        current_bottleneck=payload.current_bottleneck,
        validation_needs=payload.validation_needs,
        time_horizon=payload.time_horizon,
        success_metric=payload.success_metric,
        sample_lane=payload.sample_lane,
        constraint_profile=payload.constraint_profile.model_dump(),
    )
    refresh_workload_completeness(workload)
    db.add(workload)
    db.commit()
    db.refresh(workload)
    ensure_chat_thread(db, workload)
    return workload


@router.post("/{workload_id}/assess", response_model=AssessmentRead)
def assess_workload_route(
    workload_id: str,
    request: Request,
    db: Session = Depends(get_session),
):
    """Assess a workload deterministically and persist the latest result."""

    workload = _get_workload_or_404(db, workload_id)
    refresh_workload_completeness(workload)
    snapshot = assess_workload(workload)
    workflow_result = run_shared_workflow(request.app.state.settings, workload)
    citations = citations_from_workflow(workflow_result)

    assessment = (
        db.query(Assessment)
        .filter(Assessment.workload_id == workload.id)
        .order_by(Assessment.created_at.desc())
        .first()
    )
    if assessment is None:
        assessment = Assessment(workload_id=workload.id)
        db.add(assessment)

    assessment.disposition = snapshot.disposition
    assessment.confidence_band = snapshot.confidence_band
    assessment.summary = snapshot.summary
    assessment.score_breakdown = snapshot.score_breakdown
    assessment.rationale = snapshot.rationale
    assessment.assumptions = snapshot.assumptions
    assessment.change_drivers = snapshot.change_drivers
    assessment.citations = citations

    db.commit()
    db.refresh(assessment)
    return assessment


@router.post("/{workload_id}/architecture", response_model=ArchitectureRead)
def create_architecture_route(
    workload_id: str,
    request: Request,
    db: Session = Depends(get_session),
):
    """Build and persist a hybrid workflow plan."""

    workload = _get_workload_or_404(db, workload_id)
    workflow_result = run_shared_workflow(request.app.state.settings, workload)
    citations = citations_from_workflow(workflow_result)

    plan = (
        db.query(HybridPlan)
        .filter(HybridPlan.workload_id == workload.id)
        .order_by(HybridPlan.created_at.desc())
        .first()
    )
    if plan is None:
        plan = HybridPlan(workload_id=workload.id)
        db.add(plan)

    plan.summary = workflow_result.architecture.summary
    plan.classical_lane = workflow_result.architecture.classical_lane
    plan.quantum_lane = workflow_result.architecture.quantum_lane
    plan.verification_lane = workflow_result.architecture.verification_lane
    plan.citations = citations

    db.commit()
    db.refresh(plan)
    return plan


@router.post("/{workload_id}/explain", response_model=ExplanationRead)
def explain_workload_route(
    workload_id: str,
    payload: ExplanationRequest,
    request: Request,
    db: Session = Depends(get_session),
):
    """Explain the workload for a chosen audience mode."""

    workload = _get_workload_or_404(db, workload_id)
    workflow_result = run_shared_workflow(request.app.state.settings, workload)
    return ExplanationRead(
        mode=payload.mode,
        content=select_explanation(payload.mode, workflow_result),
        citations=citations_from_workflow(workflow_result),
    )


@router.post("/{workload_id}/prototype", response_model=JobRead, status_code=status.HTTP_202_ACCEPTED)
def queue_prototype_route(
    workload_id: str,
    payload: PrototypeJobCreate,
    request_id: str = Depends(get_request_id),
    db: Session = Depends(get_session),
):
    """Queue a background job for prototype or export generation."""

    workload = _get_workload_or_404(db, workload_id)
    job = queue_job(
        db=db,
        workload=workload,
        job_type=payload.job_type,
        request_payload=payload.model_dump(),
        correlation_id=request_id,
    )
    return job
