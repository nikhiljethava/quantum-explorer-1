"""OpenFermion adapter scaffold."""

from .base import QuantumAdapter


class OpenFermionAdapter(QuantumAdapter):
    adapter_name = "openfermion"
    module_name = "openfermion"
