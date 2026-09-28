"""The trait contract as the Python binding reads it (HOST-001, UNIT-017).

The JSON Schemas of ``schema/`` are the single source of truth: the names the
binding accepts (tell-tale functions, units) are read from them, never copied.
"""

from __future__ import annotations

import json
import pathlib
from functools import cache
from typing import Any

SCHEMA_DIR = pathlib.Path(__file__).parent / "schema"


@cache
def schema(name: str) -> dict[str, Any]:
    """One schema of ``schema/``, by file name without ``.schema.json``."""
    data: dict[str, Any] = json.loads((SCHEMA_DIR / f"{name}.schema.json").read_text("utf-8"))
    return data


def unit_table() -> dict[str, dict[str, Any]]:
    """Units by quantity, and the unit each unit system assigns (UNIT-002)."""
    table: dict[str, dict[str, Any]] = schema("units")["x-awa-units"]
    return table


#: Unit systems (UNIT-001).
UNIT_SYSTEMS: tuple[str, ...] = tuple(schema("units")["$defs"]["unitSystem"]["enum"])

#: Every unit name the front end accepts (UNIT-017).
UNITS: tuple[str, ...] = tuple(u for q in unit_table().values() for u in q["units"])

#: Tell-tale functions (TEL-002).
TELLTALE_FUNCTIONS: tuple[str, ...] = tuple(schema("telltale")["$defs"]["function"]["enum"])

#: States of a tell-tale (TEL-004).
TELLTALE_STATES: tuple[str, ...] = tuple(schema("telltale")["$defs"]["state"]["enum"])
