"""Local corpus retrieval implementation used for the first version."""

from pathlib import Path
from typing import List

from ..contracts import RetrievalHit, RetrievalResult


class LocalCorpusRetriever:
    """Score local markdown files with a simple keyword overlap heuristic."""

    def __init__(self, corpus_root: Path) -> None:
        self.corpus_root = corpus_root

    def retrieve(self, query_terms: List[str], limit: int = 3) -> RetrievalResult:
        lowered_terms = [term.lower() for term in query_terms if term]
        hits = []
        for path in sorted(self.corpus_root.glob("*.md")):
            content = path.read_text(encoding="utf-8")
            lowered_content = content.lower()
            score = sum(lowered_content.count(term) for term in lowered_terms)
            if score <= 0:
                continue
            excerpt = " ".join(content.split())[:220]
            hits.append(
                RetrievalHit(
                    source_id=path.stem,
                    title=path.stem.replace("-", " ").title(),
                    excerpt=excerpt,
                    score=score,
                )
            )

        hits.sort(key=lambda item: item.score, reverse=True)
        return RetrievalResult(query_terms=query_terms, hits=hits[:limit])
