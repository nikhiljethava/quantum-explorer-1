"""Cirq adapter scaffold."""

from .base import QuantumAdapter


class CirqAdapter(QuantumAdapter):
    adapter_name = "cirq"
    module_name = "cirq"
