"""Seed sample projects and workloads for local demos."""

from sqlalchemy.orm import Session

from app.models import Project, Workload
from app.services.chat import ensure_chat_thread
from app.services.intake import refresh_workload_completeness


def ensure_seed_data(db: Session) -> None:
    """Seed a minimal demo catalog if the database is empty."""

    if db.query(Project).count() > 0:
        return

    demo_project = Project(
        name="Hybrid Quantum Demo Portfolio",
        description="Curated local-first workloads for chemistry and optimization demos.",
        domain="portfolio",
    )
    db.add(demo_project)
    db.flush()

    workloads = [
        Workload(
            project_id=demo_project.id,
            title="Battery electrolyte screening",
            domain="materials",
            problem_family="chemistry_materials",
            representation="molecule",
            business_objective="Screen promising electrolyte candidates faster.",
            current_baseline="Classical DFT pipeline plus heuristic ranking.",
            current_bottleneck="Electronic-structure calculations are slow on selected candidates.",
            validation_needs="Scientifically credible and explainable prototype results.",
            time_horizon="prototype_now",
            success_metric="Reduce exploratory screening cost and clarify future quantum value.",
            sample_lane="chemistry",
            constraint_profile={
                "accuracy": "high",
                "latency": "medium",
                "cost": "medium",
                "explainability": "high",
            },
        ),
        Workload(
            project_id=demo_project.id,
            title="Molecule simulation workshop",
            domain="chemistry",
            problem_family="molecule_simulation",
            representation="hamiltonian",
            business_objective="Teach a credible molecule simulation workflow to the architecture team.",
            current_baseline="Ad hoc notebooks and slideware.",
            current_bottleneck="The team lacks a structured prototype path and shared artifacts.",
            validation_needs="Prototype-friendly but technically inspectable outputs.",
            time_horizon="research_pilot",
            success_metric="Produce a reproducible local demo package.",
            sample_lane="chemistry",
            constraint_profile={
                "accuracy": "medium",
                "latency": "low",
                "cost": "low",
                "explainability": "high",
            },
        ),
        Workload(
            project_id=demo_project.id,
            title="Portfolio and routing optimization",
            domain="optimization",
            problem_family="portfolio_optimization",
            representation="graph",
            business_objective="Explore a hybrid optimization story for constrained routing and portfolio allocation.",
            current_baseline="Classical optimizers provide workable but sometimes brittle solutions.",
            current_bottleneck="Scenario exploration is slow when constraints change frequently.",
            validation_needs="Conservative prototype framing with clear caveats.",
            time_horizon="prototype_now",
            success_metric="Produce an optimization demo with artifact outputs for internal review.",
            sample_lane="optimization",
            constraint_profile={
                "accuracy": "medium",
                "latency": "medium",
                "cost": "medium",
                "explainability": "high",
            },
        ),
    ]

    for workload in workloads:
        refresh_workload_completeness(workload)
        db.add(workload)

    db.commit()

    persisted = db.query(Workload).all()
    for workload in persisted:
        ensure_chat_thread(db, workload)
