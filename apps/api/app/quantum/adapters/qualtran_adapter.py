"""Qualtran adapter scaffold."""

from .base import QuantumAdapter


class QualtranAdapter(QuantumAdapter):
    adapter_name = "qualtran"
    module_name = "qualtran"
