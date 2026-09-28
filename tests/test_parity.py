"""Python side of the parity cases shared with the front end (HOST-003).

The front end computes every figure (``js/test/units.test.ts`` runs the same
files); the binding must accept the same unit names and systems, so that a
case a host can express in TypeScript it can express in Python too.
"""

from __future__ import annotations

import json
import pathlib
from typing import Any

import pytest
import traitlets as t
from anywidget_instruments._base import _float_to_json

import anywidget_automotives as aa

PARITY = pathlib.Path(__file__).parent / "parity"


def _load(name: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads((PARITY / name).read_text("utf-8"))
    return data


UNITS = _load("units.json")


def test_every_unit_of_the_conversion_cases_is_accepted_by_the_binding() -> None:
    for case in UNITS["convert"]:
        assert case["from"] in aa.UNITS
        assert case["to"] in aa.UNITS


def test_every_unit_system_of_the_cases_is_accepted_by_the_binding() -> None:
    for case in UNITS["resolve"]:
        assert case["traits"].get("unit_system", "metric") in aa.UNIT_SYSTEMS


DIALS = _load("dials.json")["cases"]


def _json(v: Any) -> Any:
    return json.loads(json.dumps(_float_to_json(v)))


@pytest.mark.parametrize("case", DIALS, ids=[f"{c['widget']} {c['traits']}" for c in DIALS])
def test_the_binding_passes_the_traits_of_a_dial_through_unchanged(case: dict[str, Any]) -> None:
    """HOST-003: the figures are the front end's; the binding only sets the traits.

    A trait the binding refuses is one the front end shows invalid.
    """
    cls = getattr(aa, case["widget"])
    traits = {
        k: float(v) if isinstance(v, str) and k == "value" else v for k, v in case["traits"].items()
    }
    try:
        w = cls(**traits)
    except t.TraitError:
        assert case["readout"] == "INVALID"
        return
    state = w.get_state()
    for name, sent in case["traits"].items():
        assert _json(state[name]) == _json(sent), name


TRIPS = _load("trip.json")["cases"]


@pytest.mark.parametrize("case", TRIPS, ids=[c["name"] for c in TRIPS])
def test_the_binding_passes_a_trip_through_unchanged(case: dict[str, Any]) -> None:
    energy = case.get("energy", "fuel")
    w = aa.TripComputer(case["trip"], unit_system=case["unit_system"], energy=energy)
    assert _json(w.get_state()["value"]) == _json(case["trip"])
