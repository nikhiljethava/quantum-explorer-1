"""Root workflow agent coordinating deterministic sub-agents."""

from pathlib import Path

from .agents import ExplainerAgent, HybridArchitectAgent, RetrievalAgent, ScoutAgent
from .contracts import NormalizedWorkload, WorkflowResult


class RootWorkflowAgent:
    """Main orchestration entrypoint shared by API and agent_lab."""

    def __init__(self, corpus_root: Path) -> None:
        self.scout_agent = ScoutAgent()
        self.retrieval_agent = RetrievalAgent(corpus_root)
        self.hybrid_architect_agent = HybridArchitectAgent()
        self.explainer_agent = ExplainerAgent()

    def run(self, workload: NormalizedWorkload) -> WorkflowResult:
        scout = self.scout_agent.run(workload)
        retrieval = self.retrieval_agent.run(workload, scout)
        architecture = self.hybrid_architect_agent.run(workload, scout, retrieval)
        explanations = self.explainer_agent.run(workload, scout, architecture)
        return WorkflowResult(
            scout=scout,
            retrieval=retrieval,
            architecture=architecture,
            explanations=explanations,
        )
