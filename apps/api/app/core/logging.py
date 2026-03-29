"""Structured logging helpers."""

import logging


def configure_logging(level: str) -> None:
    """Configure a simple structured log format."""

    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format=(
            "%(asctime)s level=%(levelname)s logger=%(name)s "
            "message=%(message)s"
        ),
    )
