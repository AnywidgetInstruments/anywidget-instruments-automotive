"""Quantities of a host unit library, passed on as a number and a unit name (UNIT-018).

A binding may accept the quantities of its language's unit library; the front
end neither needs nor knows them (GEN-004). This one accepts pint quantities
(or any object with ``to`` and ``magnitude``, as pint's) for the traits of a
widget given in ``input_unit``: they are converted there into that unit, and
the widget receives a plain number.
"""

from __future__ import annotations

from typing import Any

import traitlets as t

#: pint's name for each unit of the trait contract that converts linearly.
#: A fuel economy is reciprocal between its units: give it as a number.
PINT_UNITS: dict[str, str] = {
    "km/h": "kilometer / hour",
    "mph": "mile / hour",
    "km": "kilometer",
    "mi": "mile",
    "L": "liter",
    "imperial gal": "imperial_gallon",
    "US gal": "gallon",
    "L/h": "liter / hour",
    "imperial gal/h": "imperial_gallon / hour",
    "US gal/h": "gallon / hour",
    "°C": "degC",
    "°F": "degF",
    "kPa": "kilopascal",
    "psi": "psi",
    "bar": "bar",
    "rpm": "revolution / minute",
    "%": "percent",
}


def is_quantity(value: Any) -> bool:
    """True for a quantity of a unit library (pint's shape: ``to`` and ``magnitude``)."""
    return hasattr(value, "magnitude") and callable(getattr(value, "to", None))


def magnitude_in(value: Any, unit: str, where: str) -> float:
    """The magnitude of a quantity in the contract unit ``unit``."""
    target = PINT_UNITS.get(unit)
    if target is None:
        raise t.TraitError(f"{where}: give a number in {unit!r}, not a quantity")
    try:
        return float(value.to(target).magnitude)
    except Exception as exc:  # a unit library raises its own dimensionality error
        raise t.TraitError(f"{where}: {value!r} cannot be expressed in {unit!r}") from exc
