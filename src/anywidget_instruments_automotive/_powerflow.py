"""PowerFlow: the power flows of a hybrid drivetrain (EV-007)."""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any

import traitlets as t
from anywidget_instruments import size_trait

from ._base import AutomotiveWidget

#: Powers of a hybrid drivetrain, in kW.
POWER_FIELDS = ("engine", "battery", "wheels")


class PowerFlow(AutomotiveWidget):
    """Which of the engine, the battery and the wheels deliver and receive power.

    ``value`` holds powers in kW: ``engine`` (≥ 0), ``battery`` (> 0
    discharging, < 0 charging) and ``wheels`` (> 0 driven, < 0 braking with
    regeneration). The front end draws the flows as arrows and names them, with
    the mode: EV, HYBRID, ENGINE, CHARGING, REGEN or IDLE.
    """

    _kind = t.Unicode("awa-powerflow").tag(sync=True)
    value = t.Dict(default_value=None, allow_none=True).tag(sync=True)
    label = t.Unicode("Power flow").tag(sync=True)
    size = size_trait(240, 150)
    _default_size = (240, 150)

    def __init__(self, value: Mapping[str, float | None] | None = None, **kwargs: Any) -> None:
        super().__init__(value=value, **kwargs)

    @t.validate("value")
    def _validate_value(self, proposal: Any) -> dict[str, float | None] | None:
        value = proposal["value"]
        if value is None:
            return None
        if not isinstance(value, Mapping) or set(value) - set(POWER_FIELDS):
            raise t.TraitError(
                f"the value of a PowerFlow is a dict of {POWER_FIELDS}, got {value!r}"
            )
        out: dict[str, float | None] = {}
        for k, v in value.items():
            if v is None:
                out[k] = None
                continue
            if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v):
                raise t.TraitError(f"the {k!r} power is a finite number or None, got {v!r}")
            if k == "engine" and v < 0:
                raise t.TraitError(f"an engine delivers power: {v!r} kW")
            out[k] = float(v)
        return out

    def __repr__(self) -> str:
        return f"PowerFlow({self.value!r})"
