"""SQLAlchemy models for product state."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


def utcnow() -> datetime:
    return datetime.utcnow()


class TimestampMixin:
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False, default="")
    domain = Column(String(100), nullable=False, default="mixed")
    status = Column(String(50), nullable=False, default="active")

    workloads = relationship("Workload", back_populates="project", cascade="all, delete-orphan")


class Workload(Base, TimestampMixin):
    __tablename__ = "workloads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    title = Column(String(200), nullable=False)
    domain = Column(String(100), nullable=False, default="mixed")
    problem_family = Column(String(100), nullable=False)
    representation = Column(String(100), nullable=False)
    business_objective = Column(Text, nullable=False)
    current_baseline = Column(Text, nullable=False)
    current_bottleneck = Column(Text, nullable=False)
    validation_needs = Column(Text, nullable=False, default="")
    time_horizon = Column(String(100), nullable=False)
    success_metric = Column(Text, nullable=False, default="")
    constraint_profile = Column(JSON, nullable=False, default=dict)
    completeness_score = Column(Float, nullable=False, default=0.0)
    missing_fields = Column(JSON, nullable=False, default=list)
    sample_lane = Column(String(100), nullable=False, default="")
    status = Column(String(50), nullable=False, default="draft")

    project = relationship("Project", back_populates="workloads")
    assessments = relationship("Assessment", back_populates="workload", cascade="all, delete-orphan")
    hybrid_plans = relationship("HybridPlan", back_populates="workload", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="workload", cascade="all, delete-orphan")
    chat_threads = relationship("ChatThread", back_populates="workload", cascade="all, delete-orphan")


class Assessment(Base, TimestampMixin):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    workload_id = Column(String(36), ForeignKey("workloads.id"), nullable=False)
    disposition = Column(String(100), nullable=False)
    confidence_band = Column(String(50), nullable=False)
    summary = Column(Text, nullable=False)
    score_breakdown = Column(JSON, nullable=False, default=dict)
    rationale = Column(JSON, nullable=False, default=list)
    assumptions = Column(JSON, nullable=False, default=list)
    change_drivers = Column(JSON, nullable=False, default=list)
    citations = Column(JSON, nullable=False, default=list)

    workload = relationship("Workload", back_populates="assessments")


class HybridPlan(Base, TimestampMixin):
    __tablename__ = "hybrid_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    workload_id = Column(String(36), ForeignKey("workloads.id"), nullable=False)
    summary = Column(Text, nullable=False)
    classical_lane = Column(JSON, nullable=False, default=list)
    quantum_lane = Column(JSON, nullable=False, default=list)
    verification_lane = Column(JSON, nullable=False, default=list)
    citations = Column(JSON, nullable=False, default=list)

    workload = relationship("Workload", back_populates="hybrid_plans")


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    workload_id = Column(String(36), ForeignKey("workloads.id"), nullable=False)
    job_type = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="queued")
    progress = Column(Integer, nullable=False, default=0)
    request_payload = Column(JSON, nullable=False, default=dict)
    result_summary = Column(JSON, nullable=False, default=dict)
    error_message = Column(Text, nullable=True)
    correlation_id = Column(String(64), nullable=False, default="")

    workload = relationship("Workload", back_populates="jobs")
    artifacts = relationship("Artifact", back_populates="job", cascade="all, delete-orphan")


class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False)
    workload_id = Column(String(36), ForeignKey("workloads.id"), nullable=False)
    kind = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="ready")
    storage_path = Column(Text, nullable=False)
    download_url = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=False, default=dict)

    job = relationship("Job", back_populates="artifacts")


class ChatThread(Base, TimestampMixin):
    __tablename__ = "chat_threads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    workload_id = Column(String(36), ForeignKey("workloads.id"), nullable=False)
    title = Column(String(200), nullable=False, default="Workload discussion")
    status = Column(String(50), nullable=False, default="active")

    workload = relationship("Workload", back_populates="chat_threads")
    turns = relationship("ChatTurn", back_populates="thread", cascade="all, delete-orphan")


class ChatTurn(Base, TimestampMixin):
    __tablename__ = "chat_turns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    thread_id = Column(String(36), ForeignKey("chat_threads.id"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    citations = Column(JSON, nullable=False, default=list)

    thread = relationship("ChatThread", back_populates="turns")
