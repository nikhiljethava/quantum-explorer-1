"""Audience-specific explanation helpers."""

from hybrid_quantum_workload_navigator_agents import WorkflowResult


def select_explanation(mode: str, workflow_result: WorkflowResult) -> str:
    """Return the appropriate explanation string for the requested mode."""

    normalized_mode = mode.lower()
    if normalized_mode == "architect":
        return workflow_result.explanations.architect_summary
    if normalized_mode == "scientist":
        return workflow_result.explanations.scientist_summary
    return workflow_result.explanations.exec_summary
