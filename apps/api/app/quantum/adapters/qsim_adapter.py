"""qsim adapter scaffold with explicit fallback messaging."""

from .base import QuantumAdapter


class QsimAdapter(QuantumAdapter):
    adapter_name = "qsim"
    module_name = "qsimcirq"
