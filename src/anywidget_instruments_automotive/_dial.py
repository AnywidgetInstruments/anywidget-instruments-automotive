"""Dials: speedometer, tachometer, fuel and temperature gauges (DIAL, SPD).

The binding sets traits: a value and its limits in ``input_unit``, unit names
from the contract. Conversion, rounding (a speed is never shown rounded down,
SPD-001), zones and the states of the value are the front end's (GEN-004).
"""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any

import traitlets as t
from anywidget_instruments import float_serializers, size_trait

from ._base import AutomotiveWidget
from ._contract import UNIT_SYSTEMS, unit_table, units_of
from ._quantities import is_quantity, magnitude_in

_ZONE_KEYS = {"from", "to", "kind"}
_ZONE_KINDS = ("danger", "warning", "cold", "charge")


def _zone(z: Any) -> dict[str, Any]:
    if not isinstance(z, Mapping) or set(z) != _ZONE_KEYS:
        raise t.TraitError(f"a zone is a dict with the keys {sorted(_ZONE_KEYS)}, got {z!r}")
    if z["kind"] not in _ZONE_KINDS:
        raise t.TraitError(f"the kind of a zone is one of {_ZONE_KINDS}, got {z['kind']!r}")
    for k in ("from", "to"):
        if isinstance(z[k], bool) or not isinstance(z[k], (int, float)) or not math.isfinite(z[k]):
            raise t.TraitError(f"the {k!r} of a zone is a finite number, got {z[k]!r}")
    return {"from": float(z["from"]), "to": float(z["to"]), "kind": z["kind"]}


class QuantityWidget(AutomotiveWidget):
    """A widget showing a physical quantity (API-005, UNIT-001 .. UNIT-017).

    value
        In ``input_unit``; ``None`` until a value is known (ROB-002).
    min, max
        Ends of the scale, in ``input_unit``.
    unit
        Displayed unit; ``""``: the one ``unit_system`` assigns (UNIT-003).
    input_unit
        Unit of ``value``, ``min``, ``max`` and limits; ``""``: the metric unit
        of the quantity (UNIT-010).
    unit_system
        ``"metric"``, ``"imperial"`` or ``"us"`` (UNIT-001).
    """

    #: Quantity of the widget, a key of the unit table of the contract.
    _quantity = ""

    value = t.Float(None, allow_none=True).tag(sync=True, **float_serializers)
    min = t.Float(0.0).tag(sync=True)
    max = t.Float(100.0).tag(sync=True)
    unit = t.Unicode("").tag(sync=True)
    input_unit = t.Unicode("").tag(sync=True)
    unit_system = t.Enum(UNIT_SYSTEMS, default_value="metric").tag(sync=True)

    #: Traits given in ``input_unit``: they accept a quantity of a unit library (UNIT-018).
    _in_input_unit = frozenset(
        {"value", "min", "max", "limit", "redline", "shift_light", "cold", "hot", "trip", "reserve"}
    )

    def __init__(self, value: Any = None, **kwargs: Any) -> None:
        unit = kwargs.get("input_unit", "")
        kwargs = {k: self._number(k, v, unit) for k, v in kwargs.items()}
        super().__init__(value=self._number("value", value, unit), **kwargs)

    def _number(self, name: str, value: Any, input_unit: str) -> Any:
        """A quantity as a number in ``input_unit`` (or the metric unit), anything else as is."""
        if name not in self._in_input_unit or not is_quantity(value):
            return value
        unit = input_unit or unit_table()[self._quantity]["units"][0]
        return magnitude_in(value, unit, f"{type(self).__name__}.{name}")

    def __setattr__(self, name: str, value: Any) -> None:
        if is_quantity(value):
            value = self._number(name, value, getattr(self, "input_unit", ""))
        super().__setattr__(name, value)

    @t.validate("min", "max")
    def _validate_range(self, proposal: Any) -> float:
        v = float(proposal["value"])
        if not math.isfinite(v):
            raise t.TraitError(f"{type(self).__name__}.{proposal['trait'].name} must be finite")
        return v

    def __repr__(self) -> str:
        return f"{type(self).__name__}({self.value!r})"


class DialWidget(QuantityWidget):
    """A needle on an arc scale, and the value as text below it (DIAL-001 .. DIAL-005).

    zones
        Coloured arcs, ``{"from", "to", "kind"}`` in ``input_unit``; ``kind`` is
        ``"danger"``, ``"warning"``, ``"cold"`` or ``"charge"`` (DIAL-005).
    resolution
        Step of the readout, in the displayed unit.
    animate
        The needle glides to a new value; ``False``: it jumps (DIS-003).
    """

    ticks = t.Int(6, min=1).tag(sync=True)
    minor_ticks = t.Int(4, min=0).tag(sync=True)
    zones = t.List(t.Any(), default_value=[]).tag(sync=True)
    resolution = t.Float(1.0).tag(sync=True)
    animate = t.Bool(True).tag(sync=True)
    size = size_trait(200, 200)
    _default_size = (200, 200)

    @t.validate("zones")
    def _validate_zones(self, proposal: Any) -> list[dict[str, Any]]:
        return [_zone(z) for z in proposal["value"]]

    @t.validate("resolution")
    def _validate_resolution(self, proposal: Any) -> float:
        v = float(proposal["value"])
        if not v > 0 or not math.isfinite(v):
            raise t.TraitError(f"{type(self).__name__}.resolution must be positive, got {v!r}")
        return v


def _optional(default: float | None = None) -> Any:
    return t.Float(default, allow_none=True).tag(sync=True)


class Speedometer(DialWidget):
    """Vehicle speed on a dial with a digital readout (DIAL-101, SPD-001 .. SPD-004).

    The readout is rounded up to ``resolution`` after conversion, never down.
    The widget cannot guarantee the accuracy of the value it is given and does
    not replace the vehicle's speedometer (SPD-004): see the safety notice.

    limit
        Speed limit in ``input_unit``, marked on the scale; the readout is
        highlighted above it (SPD-003).
    """

    _kind = t.Unicode("awa-speedometer").tag(sync=True)
    _quantity = "speed"
    unit = t.Enum(units_of("speed"), default_value="").tag(sync=True)
    input_unit = t.Enum(units_of("speed"), default_value="").tag(sync=True)
    max = t.Float(220.0).tag(sync=True)
    label = t.Unicode("Speed").tag(sync=True)
    limit = _optional()


class Tachometer(DialWidget):
    """Engine speed in rpm (DIAL-102 .. DIAL-104).

    redline
        Start of the red zone; ``None``: no red zone.
    shift_light
        Engine speed at and above which the shift light is lit.
    ready
        The vehicle can move: at 0 rpm the dial says READY (hybrid and electric
        drivetrains).
    """

    _kind = t.Unicode("awa-tachometer").tag(sync=True)
    _quantity = "engine_speed"
    unit = t.Enum(units_of("engine_speed"), default_value="").tag(sync=True)
    input_unit = t.Enum(units_of("engine_speed"), default_value="").tag(sync=True)
    max = t.Float(7000.0).tag(sync=True)
    ticks = t.Int(7, min=1).tag(sync=True)
    resolution = t.Float(50.0).tag(sync=True)
    label = t.Unicode("Engine speed").tag(sync=True)
    redline = _optional()
    shift_light = _optional()
    ready = t.Bool(False).tag(sync=True)


class FuelGauge(DialWidget):
    """Fuel level from empty to full, with a reserve zone and the fuel pump symbol.

    reserve
        Upper end of the reserve zone, in percent of a full tank; the pump
        symbol lights amber in it (DIAL-105).
    filler_side
        ``"left"`` or ``"right"``: the side of the filler flap (DIAL-106).
    """

    _kind = t.Unicode("awa-fuelgauge").tag(sync=True)
    _quantity = "level"
    unit = t.Enum(units_of("level"), default_value="").tag(sync=True)
    input_unit = t.Enum(units_of("level"), default_value="").tag(sync=True)
    ticks = t.Int(2, min=1).tag(sync=True)
    minor_ticks = t.Int(1, min=0).tag(sync=True)
    label = t.Unicode("Fuel").tag(sync=True)
    reserve = t.Float(12.0, min=0.0).tag(sync=True)
    filler_side = t.Enum(["", "left", "right"], default_value="").tag(sync=True)
    size = size_trait(160, 130)
    _default_size = (160, 130)


class TemperatureGauge(DialWidget):
    """Coolant or oil temperature, with cold and hot zones (DIAL-107, DIAL-108).

    cold
        Upper end of the cold zone; ``None``: none.
    hot
        Start of the hot zone, where the temperature tell-tale lights red.
    """

    _kind = t.Unicode("awa-temperaturegauge").tag(sync=True)
    _quantity = "temperature"
    unit = t.Enum(units_of("temperature"), default_value="").tag(sync=True)
    input_unit = t.Enum(units_of("temperature"), default_value="").tag(sync=True)
    min = t.Float(40.0).tag(sync=True)
    max = t.Float(130.0).tag(sync=True)
    ticks = t.Int(3, min=1).tag(sync=True)
    label = t.Unicode("Coolant").tag(sync=True)
    cold = _optional(60.0)
    hot = _optional(115.0)
    size = size_trait(160, 130)
    _default_size = (160, 130)


class StateOfChargeGauge(DialWidget):
    """The charge of the traction battery, 0 to 100 % (EV-001, EV-002).

    low
        Upper end of the low zone, in percent; the battery symbol lights amber
        in it.
    charging
        The battery is charging: a charging symbol and the text CHARGING.
    """

    _kind = t.Unicode("awa-stateofchargegauge").tag(sync=True)
    _quantity = "level"
    unit = t.Enum(units_of("level"), default_value="").tag(sync=True)
    input_unit = t.Enum(units_of("level"), default_value="").tag(sync=True)
    ticks = t.Int(2, min=1).tag(sync=True)
    minor_ticks = t.Int(1, min=0).tag(sync=True)
    label = t.Unicode("Battery").tag(sync=True)
    low = t.Float(15.0, min=0.0).tag(sync=True)
    charging = t.Bool(False).tag(sync=True)
    size = size_trait(160, 130)
    _default_size = (160, 130)


class PowerMeter(DialWidget):
    """The power of the drivetrain in kW (EV-003 .. EV-005).

    Positive while it drives the wheels, negative while it regenerates: the
    part of the scale below zero is the regeneration zone, and the meter says
    REGEN. ``ready``: at 0 kW the meter says READY.
    """

    _kind = t.Unicode("awa-powermeter").tag(sync=True)
    _quantity = "power"
    unit = t.Enum(units_of("power"), default_value="").tag(sync=True)
    input_unit = t.Enum(units_of("power"), default_value="").tag(sync=True)
    min = t.Float(-60.0).tag(sync=True)
    max = t.Float(150.0).tag(sync=True)
    ticks = t.Int(7, min=1).tag(sync=True)
    label = t.Unicode("Power").tag(sync=True)
    ready = t.Bool(False).tag(sync=True)
