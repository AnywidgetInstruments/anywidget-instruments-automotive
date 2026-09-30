"""Conformance of the Python binding with the trait contract (HOST-001, HOST-002).

``npm run build`` flattens the JSON Schemas of ``schema/`` (which extend those of
anywidget-instruments) into ``static/contract.json``, the file shipped for hosts
in any language. These tests fail when a traitlets declaration or a class
default of the binding diverges from it.
"""

from __future__ import annotations

import json
import math
import pathlib
from typing import Any

import pytest
import traitlets as t

import anywidget_instruments_automotive as aa
from anywidget_instruments_automotive import _base

PKG = pathlib.Path(aa.__file__).parent
CONTRACT_FILE = PKG / "static" / "contract.json"

if not CONTRACT_FILE.exists():  # pragma: no cover - the bundle is built before the tests
    pytest.skip("static/contract.json missing: run `npm run build`", allow_module_level=True)

CONTRACT = json.loads(CONTRACT_FILE.read_text("utf-8"))
FRAMEWORK = set(CONTRACT["frameworkTraits"])
CLASSES: dict[str, type] = {
    **{n: c for n, c in vars(aa).items() if isinstance(c, type)},
    "AutomotiveWidget": _base.AutomotiveWidget,
}
WIDGETS = sorted((k, v) for k, v in CONTRACT["widgets"].items() if v["class"] in CLASSES)
IDS = [title for title, _ in WIDGETS]
WIDGET_CLASSES = sorted(
    n
    for n, c in vars(aa).items()
    if isinstance(c, type) and issubclass(c, _base.AutomotiveWidget) and c._kind.default_value
)


def _synced(cls: type) -> dict[str, t.TraitType]:
    return {k: v for k, v in cls.class_traits(sync=True).items() if k not in FRAMEWORK}


def _json(value: Any) -> Any:
    return json.loads(json.dumps(value))


def test_every_widget_has_a_schema() -> None:
    """A new widget cannot skip the contract: its class has a schema."""
    classes = {w["class"] for w in CONTRACT["widgets"].values()}
    assert WIDGET_CLASSES
    assert set(WIDGET_CLASSES) <= classes, sorted(set(WIDGET_CLASSES) - classes)


def test_every_schema_of_a_widget_has_a_class() -> None:
    concrete = {w["class"] for w in CONTRACT["widgets"].values() if not w["abstract"]}
    assert concrete == set(WIDGET_CLASSES)


def test_every_widget_has_a_value_and_is_an_indicator() -> None:
    """API-001, API-002."""
    for name in WIDGET_CLASSES:
        cls = CLASSES[name]
        assert "value" in cls.class_traits(sync=True), name
        assert cls().mode == "indicator", name
        with pytest.raises(t.TraitError):
            cls(mode="control")


def test_every_kind_is_prefixed_so_as_not_to_meet_one_of_anywidget_instruments() -> None:
    for spec in CONTRACT["widgets"].values():
        assert spec["abstract"] or spec["kind"].startswith("awa-")


@pytest.mark.parametrize(("title", "spec"), WIDGETS, ids=IDS)
def test_trait_names(title: str, spec: dict[str, Any]) -> None:
    assert set(_synced(CLASSES[spec["class"]])) == set(spec["traits"]), title


@pytest.mark.parametrize(("title", "spec"), WIDGETS, ids=IDS)
def test_class_defaults(title: str, spec: dict[str, Any]) -> None:
    """A host reading the contract builds the same widget as the binding's class defaults."""
    for name, trait in _synced(CLASSES[spec["class"]]).items():
        default = trait.default()
        if isinstance(default, tuple):
            default = list(default)
        assert _json(default) == spec["traits"][name]["default"], f"{title}.{name}"


@pytest.mark.parametrize(("title", "spec"), WIDGETS, ids=IDS)
def test_trait_types(title: str, spec: dict[str, Any]) -> None:
    for name, trait in _synced(CLASSES[spec["class"]]).items():
        s = spec["traits"][name]
        kind = s["type"]
        if isinstance(trait, t.Enum):
            assert kind in ("enum", "const"), name
            assert list(trait.values) == s["values"], name
            assert bool(trait.allow_none) == bool(s.get("nullable")), name
        elif isinstance(trait, t.Unicode):
            assert kind in ("string", "const"), name
        elif isinstance(trait, t.Bool):
            assert kind == "boolean", name
        elif isinstance(trait, (t.Int, t.CInt)):
            assert kind == "integer", name
        elif isinstance(trait, (t.Float, t.CFloat)):
            assert kind == "number", name
            lo = getattr(trait, "min", None)
            if lo is not None and not math.isinf(lo):
                assert s.get("minimum") == lo, name
        elif isinstance(trait, (t.List, t.Tuple)):
            assert kind == "array", name
        elif isinstance(trait, t.Dict):
            assert kind == "object", name
        else:  # pragma: no cover - a new trait type needs a mapping
            raise AssertionError(f"{name}: no schema mapping for {type(trait).__name__}")


def test_the_contract_lists_every_unit_the_binding_accepts() -> None:
    """UNIT-017: a host can check a unit name before setting it."""
    assert tuple(u for q in CONTRACT["units"].values() for u in q["units"]) == aa.UNITS
    for q in CONTRACT["units"].values():
        assert set(q["systems"]) == set(aa.UNIT_SYSTEMS)


def test_every_widget_of_a_quantity_exposes_min_max_unit_and_input_unit() -> None:
    """API-005."""
    for name in WIDGET_CLASSES:
        cls = CLASSES[name]
        if issubclass(cls, aa.QuantityWidget):
            for trait in ("min", "max", "unit", "input_unit"):
                assert trait in cls.class_traits(sync=True), (name, trait)


def test_the_front_end_writes_no_trait_the_binding_would_have_to_notify() -> None:
    """API-006: every trait is the host's; traitlets notifies each of them."""
    writers = {s["writer"] for w in CONTRACT["widgets"].values() for s in w["traits"].values()}
    assert writers == {"host"}
    seen: list[str] = []
    w = aa.Speedometer(1)
    w.observe(lambda c: seen.append(c["name"]))
    w.value, w.limit, w.unit_system = 2, 90, "us"
    assert seen == ["value", "_value_seq", "limit", "unit_system"]
