"""Optional Google ADK bindings for local agent debugging."""

from pathlib import Path

from .workflow import RootWorkflowAgent


def build_agent_lab_workflow(corpus_root: Path) -> RootWorkflowAgent:
    """Return the shared workflow used by the API and local agent lab."""

    return RootWorkflowAgent(corpus_root=corpus_root)


def load_google_adk() -> object:
    """Import Google ADK lazily so the scaffold can run without it."""

    try:
        from google import adk  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "Google ADK is not installed. Install it before launching agent_lab."
        ) from exc
    return adk
