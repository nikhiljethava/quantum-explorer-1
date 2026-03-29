"""Local-only entrypoint for debugging shared agents with Google ADK."""

from pathlib import Path

from hybrid_quantum_workload_navigator_agents.adk_runtime import (
    build_agent_lab_workflow,
    load_google_adk,
)


def main() -> None:
    corpus_root = Path(__file__).resolve().parents[2] / "docs" / "corpus"
    workflow = build_agent_lab_workflow(corpus_root=corpus_root)
    load_google_adk()
    print("Agent lab is ready. Shared workflow:", workflow.__class__.__name__)


if __name__ == "__main__":
    main()
