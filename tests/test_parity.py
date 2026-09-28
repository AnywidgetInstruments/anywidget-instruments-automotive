"""Python side of the parity cases shared with the front end (HOST-003).

The front end computes every figure (``js/test/units.test.ts`` runs the same
files); the binding must accept the same unit names and systems, so that a
case a host can express in TypeScript it can express in Python too.
"""

from __future__ import annotations

import json
import pathlib
from typing import Any

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
