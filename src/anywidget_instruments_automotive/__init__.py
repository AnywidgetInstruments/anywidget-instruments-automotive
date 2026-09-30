"""Automotive instruments for computational notebooks, built on anywidget-instruments.

The widgets are drawn by a TypeScript front end, which computes everything they
display from their traits; this package is the Python host binding. The widgets
are indicators for visualization, teaching, simulation and aftermarket
dashboards, not vehicle instruments: see the safety notice of the documentation.
"""

from __future__ import annotations

from ._base import AutomotiveWidget
from ._cluster import Cluster
from ._contract import TELLTALE_FUNCTIONS, TELLTALE_STATES, UNIT_SYSTEMS, UNITS
from ._dial import (
    DialWidget,
    FuelGauge,
    PowerMeter,
    QuantityWidget,
    Speedometer,
    StateOfChargeGauge,
    Tachometer,
    TemperatureGauge,
)
from ._digital import GEARS, TRIP_FIELDS, GearIndicator, Odometer, TripComputer
from ._powerflow import PowerFlow
from ._telltale import TellTale, TellTaleCluster

__all__ = [
    "GEARS",
    "TELLTALE_FUNCTIONS",
    "TELLTALE_STATES",
    "TRIP_FIELDS",
    "UNITS",
    "UNIT_SYSTEMS",
    "AutomotiveWidget",
    "Cluster",
    "DialWidget",
    "FuelGauge",
    "GearIndicator",
    "Odometer",
    "PowerFlow",
    "PowerMeter",
    "QuantityWidget",
    "Speedometer",
    "StateOfChargeGauge",
    "Tachometer",
    "TellTale",
    "TellTaleCluster",
    "TemperatureGauge",
    "TripComputer",
]

__version__ = "0.1.0.dev0"
