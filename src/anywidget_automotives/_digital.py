"""Digital displays: trip computer, odometer, gear indicator (DIG-001 .. DIG-007).

The trip computer is given the raw figures of a trip; the front end computes the
consumptions, with the rules of DIG-002 and DIG-003, and converts every figure.
"""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any

import traitlets as t
from anywidget_instruments._base import size_trait

from ._base import AutomotiveWidget
from ._contract import UNIT_SYSTEMS, units_of
from ._dial import QuantityWidget

#: Raw figures of a trip, in metric units.
TRIP_FIELDS = (
    "speed",
    "fuel_rate",
    "distance",
    "fuel_used",
    "elapsed",
    "range",
    "power",
    "energy_used",
)
#: Figures of an electric drivetrain, negative when it regenerates.
_SIGNED = frozenset({"power", "energy_used"})


def _trip(value: Any) -> dict[str, float | None] | None:
    if value is None:
        return None
    if not isinstance(value, Mapping):
        raise t.TraitError(f"the value of a TripComputer is a dict of {TRIP_FIELDS}, got {value!r}")
    unknown = set(value) - set(TRIP_FIELDS)
    if unknown:
        raise t.TraitError(f"a trip has no field(s) {sorted(unknown)}; expected {TRIP_FIELDS}")
    out: dict[str, float | None] = {}
    for k, v in value.items():
        if v is None:
            out[k] = None
            continue
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v):
            raise t.TraitError(f"the {k!r} of a trip is a finite number or None, got {v!r}")
        if v < 0 and k not in _SIGNED:
            raise t.TraitError(f"the {k!r} of a trip is ≥ 0, got {v!r}")
        out[k] = float(v)
    return out


class TripComputer(AutomotiveWidget):
    """The figures of a trip (DIG-001 .. DIG-004).

    ``value`` holds the raw figures, in metric units: ``speed`` (km/h),
    ``fuel_rate`` (L/h), ``distance`` (km), ``fuel_used`` (L), ``elapsed`` (s)
    and, optionally, ``range`` (km). The front end shows the instant
    consumption per hour below 5 km/h, no average before 0.1 km, and every
    figure in the units of ``unit_system``; ``unit`` sets the unit of the
    consumptions (``"L/100 km"``, ``"mpg (US)"``, ``"mpg (imperial)"``, ``"km/L"``).

    With ``energy="electric"`` it shows the energy consumption from ``power``
    (kW, negative when regenerating) and ``energy_used`` (kWh) instead, in
    kWh/100 km or mi/kWh (EV-006).
    """

    _kind = t.Unicode("awa-tripcomputer").tag(sync=True)
    value = t.Dict(default_value=None, allow_none=True).tag(sync=True)
    unit = t.Enum(
        (*units_of("fuel_economy"), *units_of("energy_economy")[1:]), default_value=""
    ).tag(sync=True)
    unit_system = t.Enum(UNIT_SYSTEMS, default_value="metric").tag(sync=True)
    energy = t.Enum(["fuel", "electric"], default_value="fuel").tag(sync=True)
    label = t.Unicode("Trip").tag(sync=True)
    size = size_trait(240, 170)
    _default_size = (240, 170)

    def __init__(self, value: Mapping[str, float | None] | None = None, **kwargs: Any) -> None:
        super().__init__(value=value, **kwargs)

    @t.validate("value")
    def _validate_value(self, proposal: Any) -> dict[str, float | None] | None:
        return _trip(proposal["value"])

    def update(self, **figures: float | None) -> None:
        """Set some figures of the trip, keeping the others."""
        self.value = {**(self.value or {}), **figures}

    def __repr__(self) -> str:
        return f"TripComputer({self.value!r})"


class Odometer(QuantityWidget):
    """Total and trip distance, in a mechanical-counter style (DIG-005).

    ``value`` is the total and ``trip`` the trip distance, in ``input_unit``
    (km by default); the counters never round a distance up.
    """

    _kind = t.Unicode("awa-odometer").tag(sync=True)
    _quantity = "distance"
    unit = t.Enum(units_of("distance"), default_value="").tag(sync=True)
    input_unit = t.Enum(units_of("distance"), default_value="").tag(sync=True)
    max = t.Float(999999.0).tag(sync=True)
    trip = t.Float(None, allow_none=True).tag(sync=True)
    digits = t.Int(6, min=1, max=9).tag(sync=True)
    label = t.Unicode("Odometer").tag(sync=True)
    size = size_trait(200, 90)
    _default_size = (200, 90)


#: Gears a GearIndicator shows (DIG-006).
GEARS = ("P", "R", "N", "D", "1", "2", "3", "4", "5", "6", "7", "8")


class _Gear(t.Enum):
    """A gear: a number may be given as an int."""

    def validate(self, obj: Any, value: Any) -> Any:
        if isinstance(value, int) and not isinstance(value, bool):
            value = str(value)
        return super().validate(obj, value)


class GearIndicator(AutomotiveWidget):
    """The engaged gear, ``P``, ``R``, ``N``, ``D`` or ``1`` to ``8`` (DIG-006).

    ``suggestion`` (``"up"`` or ``"down"``) shows a shift arrow (DIG-007).
    A gear number may be given as an int.
    """

    _kind = t.Unicode("awa-gearindicator").tag(sync=True)
    value = _Gear(GEARS, default_value=None, allow_none=True).tag(sync=True)
    suggestion = t.Enum(["", "up", "down"], default_value="").tag(sync=True)
    label = t.Unicode("Gear").tag(sync=True)
    size = size_trait(90, 110)
    _default_size = (90, 110)

    def __init__(self, value: str | int | None = None, **kwargs: Any) -> None:
        super().__init__(value=value, **kwargs)

    def __repr__(self) -> str:
        return f"GearIndicator({self.value!r})"
