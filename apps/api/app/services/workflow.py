"""Shared workflow orchestration helpers."""

from typing import Dict, List

from hybrid_quantum_workload_navigator_agents import RootWorkflowAgent, WorkflowResult

from app.core.config import Settings
from app.models import Workload
from app.services.intake import normalize_workload


def run_shared_workflow(settings: Settings, workload: Workload) -> WorkflowResult:
    """Execute the deterministic agent workflow against the local corpus."""

    workflow_agent = RootWorkflowAgent(corpus_root=settings.corpus_root)
    return workflow_agent.run(normalize_workload(workload))


def citations_from_workflow(workflow_result: WorkflowResult) -> List[Dict[str, object]]:
    """Map retrieval hits into API-friendly citations."""

    citations = []
    for hit in workflow_result.retrieval.hits:
        citations.append(
            {
                "source_id": hit.source_id,
                "title": hit.title,
                "excerpt": hit.excerpt,
                "score": hit.score,
            }
        )
    return citations
