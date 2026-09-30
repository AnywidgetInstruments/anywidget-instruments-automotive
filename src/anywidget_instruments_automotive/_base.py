"""Base class of every automotive widget (API-001, API-002, ROB-001).

A host binding only sets traits: everything a widget displays is computed by
the front end (GEN-004), so this module holds no conversion and no rounding.
"""

from __future__ import annotations

import pathlib
from typing import Any

import traitlets as t
from anywidget_instruments import InstrumentWidget

_STATIC = pathlib.Path(__file__).parent / "static"

#: The themes of anywidget-instruments, and the day and night themes (LEG-003).
THEMES = ("auto", "light", "dark", "system", "day", "night")


class AutomotiveWidget(InstrumentWidget):
    """Base class of the widgets of anywidget-instruments-automotive.

    It keeps the common traits of anywidget-instruments (``label``, ``tooltip``,
    ``visible``, ``disabled``, ``size``, ``style``, ``theme``) and adds:

    max_age
        Seconds after which a value not updated is shown as stale; 0: never
        (ROB-001).
    hud
        Held by a :class:`Cluster`, the widget is shown in its head-up display
        mode (HUD-004).

    Every widget is an indicator: ``mode`` is always ``"indicator"`` (API-002).
    """

    _esm = _STATIC / "index.js"
    _css = _STATIC / "index.css"

    mode = t.Enum(["indicator"], default_value="indicator").tag(sync=True)
    theme = t.Enum(THEMES, default_value="auto").tag(sync=True)
    max_age = t.Float(0.0, min=0.0).tag(sync=True)
    #: On a Cluster, the head-up display mode; on a widget it holds, shown in
    #: that mode (HUD-004).
    hud = t.Bool(False).tag(sync=True)
    #: Incremented on every assignment of ``value``, even an unchanged one: the
    #: front end counts ``max_age`` from the last update, not the last change.
    _value_seq = t.Int(0, min=0).tag(sync=True)

    _default_mode = "indicator"

    def __setattr__(self, name: str, value: Any) -> None:
        super().__setattr__(name, value)
        # traitlets only syncs a change; a host that keeps setting the same
        # value is still updating it (ROB-001)
        if name == "value":
            super().__setattr__("_value_seq", self._value_seq + 1)
