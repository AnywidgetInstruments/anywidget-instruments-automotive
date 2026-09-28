"""Automotive instruments for computational notebooks, built on anywidget-instruments.

The widgets are drawn by a TypeScript front end, which computes everything they
display from their traits; this package is the Python host binding. The widgets
are indicators for visualization, teaching, simulation and aftermarket
dashboards, not vehicle instruments: see the safety notice of the documentation.
"""

from __future__ import annotations

from ._base import AutomotiveWidget
from ._contract import TELLTALE_FUNCTIONS, TELLTALE_STATES, UNIT_SYSTEMS, UNITS
from ._telltale import TellTale, TellTaleCluster

__all__ = [
    "TELLTALE_FUNCTIONS",
    "TELLTALE_STATES",
    "UNITS",
    "UNIT_SYSTEMS",
    "AutomotiveWidget",
    "TellTale",
    "TellTaleCluster",
]

__version__ = "0.1.0.dev0"
