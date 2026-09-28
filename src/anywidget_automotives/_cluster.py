"""The Cluster (CLU-001 .. CLU-003, DIS-001, HUD-001 .. HUD-006, UNIT-004).

A Cluster is one widget: its ``value`` is the list of the trait dictionaries of
the widgets it holds, which its front end draws itself. The binding keeps that
list up to date from the Python widgets given to it, so that a change to any of
them shows in the cluster.
"""

from __future__ import annotations

import json
import pathlib
from collections.abc import Iterable, Mapping
from typing import Any

import anywidget_instruments
import traitlets as t
from anywidget_instruments._base import size_trait

from ._base import AutomotiveWidget
from ._contract import UNIT_SYSTEMS, schema

#: Kinds a Cluster can hold: every widget of the library but the Cluster.
KINDS: tuple[str, ...] = tuple(
    schema("cluster")["properties"]["value"]["items"]["properties"]["_kind"]["enum"]
)

_INSTRUMENT = (
    pathlib.Path(anywidget_instruments.__file__).parent / "schema" / "instrument.schema.json"
)
#: Traits of the widget framework, not of the widget: never part of an item.
_FRAMEWORK = frozenset(json.loads(_INSTRUMENT.read_text("utf-8"))["x-awi-framework-traits"])
#: The liveness of the widgets held is the cluster's own.
_OWN = frozenset({"_session", "_heartbeat"})


def item_of(widget: AutomotiveWidget | Mapping[str, Any]) -> dict[str, Any]:
    """The trait dictionary of a widget, as a Cluster holds it."""
    if isinstance(widget, Mapping):
        if widget.get("_kind") not in KINDS:
            raise t.TraitError(f"a Cluster holds widgets of the kinds {KINDS}, got {widget!r}")
        return dict(widget)
    if not isinstance(widget, AutomotiveWidget) or widget._kind not in KINDS:
        raise t.TraitError(f"a Cluster holds the widgets of anywidget-automotives, got {widget!r}")
    # only the widget's own traits: serializing a framework trait such as `layout`
    # needs a live comm, which a widget held by a cluster may never get
    return widget.get_state(key=_traits_of(widget))


def _traits_of(widget: AutomotiveWidget) -> list[str]:
    return [k for k in widget.keys if k not in _FRAMEWORK and k not in _OWN]


class Cluster(AutomotiveWidget):
    """An instrument panel: dials on the sides, tell-tales between, displays below.

    Parameters
    ----------
    children
        The widgets of the panel: widgets of this library, or trait dictionaries
        with a ``_kind``. A change to a widget shows in the panel.
    hud
        Head-up display mode: mirrored, on black, figures in one colour with the
        tell-tale colours kept, no animation, and only the speedometer and the
        widgets whose own ``hud`` is true (HUD-001 .. HUD-006).
    theme, unit_system, brightness
        Applied to every widget held; a widget with a ``unit`` of its own keeps
        it (CLU-002, UNIT-004).
    max_items
        Most widgets shown; ``None``: eight (DIS-001).
    """

    _kind = t.Unicode("awa-cluster").tag(sync=True)
    value: Any = t.List(t.Any(), default_value=[]).tag(sync=True)
    unit_system = t.Enum(UNIT_SYSTEMS, default_value="metric").tag(sync=True)
    brightness = t.Float(1.0, min=0.1, max=1.0).tag(sync=True)
    max_items = t.Int(None, allow_none=True, min=1).tag(sync=True)
    size = size_trait(640, 420)
    _default_size = (640, 420)

    def __init__(
        self, children: Iterable[AutomotiveWidget | Mapping[str, Any]] = (), **kwargs: Any
    ) -> None:
        self._held: list[AutomotiveWidget | Mapping[str, Any]] = []
        super().__init__(**kwargs)
        self.children = list(children)

    @property
    def children(self) -> list[AutomotiveWidget | Mapping[str, Any]]:
        """The widgets of the panel, in order."""
        return list(self._held)

    @children.setter
    def children(self, children: Iterable[AutomotiveWidget | Mapping[str, Any]]) -> None:
        children = list(children)
        items = [item_of(c) for c in children]  # refuse before changing anything
        for c in self._held:
            if isinstance(c, AutomotiveWidget):
                c.unobserve(self._on_child, names=_traits_of(c))
        self._held = children
        for c in children:
            if isinstance(c, AutomotiveWidget):
                c.observe(self._on_child, names=_traits_of(c))
        self.value = items

    def _on_child(self, _change: Any) -> None:
        self.value = [item_of(c) for c in self._held]

    @t.validate("value")
    def _validate_value(self, proposal: Any) -> list[dict[str, Any]]:
        return [item_of(i) for i in proposal["value"]]

    def __repr__(self) -> str:
        kinds = ", ".join(str(i["_kind"]).removeprefix("awa-") for i in self.value)
        return f"Cluster([{kinds}], hud={self.hud!r})"
