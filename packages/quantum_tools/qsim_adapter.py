def run_qsim_simulation() -> dict:
    """Mock qsim execution with capability fallback check."""
    # If qsim is not installed natively, fallback cleanly
    has_qsim = False
    try:
        import qsimcirq  # noqa
        has_qsim = True
    except ImportError:
        has_qsim = False
        
    if not has_qsim:
        return {
            "status": "fallback",
            "message": "qsim is not available. Falling back to smaller cirq simulator."
        }
    
    return {
        "status": "success",
        "system": "qsim",
        "message": "Executed high performance simulation"
    }
