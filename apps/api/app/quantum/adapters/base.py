"""Shared quantum adapter primitives."""

import importlib.util
from dataclasses import dataclass
from typing import Dict


@dataclass
class AdapterResult:
    adapter_name: str
    available: bool
    execution_mode: str
    notes: str


def module_available(module_name: str) -> bool:
    """Return whether an optional dependency can be imported."""

    return importlib.util.find_spec(module_name) is not None


class QuantumAdapter:
    """Base adapter with capability probing."""

    adapter_name = "base"
    module_name = ""

    def capability(self) -> AdapterResult:
        available = module_available(self.module_name) if self.module_name else True
        return AdapterResult(
            adapter_name=self.adapter_name,
            available=available,
            execution_mode="native" if available else "toy_fallback",
            notes=(
                "Adapter dependency is available."
                if available
                else "Dependency is not installed. Returning explicit toy fallback metadata."
            ),
        )

    def run_demo(self, workload_title: str) -> Dict[str, object]:
        capability = self.capability()
        return {
            "adapter_name": capability.adapter_name,
            "available": capability.available,
            "execution_mode": capability.execution_mode,
            "notes": capability.notes,
            "workload_title": workload_title,
        }
