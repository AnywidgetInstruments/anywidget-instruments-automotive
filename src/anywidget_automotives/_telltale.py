"""Tell-tales (TEL-001 .. TEL-008).

The colour and the symbol of a tell-tale come from its function and are drawn
by the front end; the binding checks the names against the contract.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any, cast

import traitlets as t
from anywidget_instruments._base import size_trait

from ._base import AutomotiveWidget
from ._contract import TELLTALE_FUNCTIONS, TELLTALE_STATES


class TellTale(AutomotiveWidget):
    """A tell-tale: the symbol of a function, lit in the colour of its meaning.

    Parameters
    ----------
    function
        One of :data:`TELLTALE_FUNCTIONS` (``"engine"``, ``"oil_pressure"``,
        ``"high_beam"``...). It sets the symbol, the name and the colour: red
        for a danger, amber for a warning, green for a function on, blue for
        the main beam (TEL-001).
    state
        ``"off"``, ``"on"`` or ``"blinking"``; ``None`` (the default) until a
        state is known, shown as no value rather than as off (ROB-002).
    """

    _kind = t.Unicode("awa-telltale").tag(sync=True)
    function = t.Enum(TELLTALE_FUNCTIONS, default_value="engine").tag(sync=True)
    value = t.Enum(TELLTALE_STATES, default_value=None, allow_none=True).tag(sync=True)
    size = size_trait(56, 56)
    _default_size = (56, 56)

    def __init__(self, function: str = "engine", state: str | None = None, **kwargs: Any) -> None:
        kwargs.setdefault("value", state)
        super().__init__(function=function, **kwargs)

    @property
    def state(self) -> str | None:
        """The state of the tell-tale: an alias of ``value``."""
        value: str | None = self.value
        return value

    @state.setter
    def state(self, state: str | None) -> None:
        self.value = state

    def __repr__(self) -> str:
        return f"TellTale({self.function!r}, value={self.value!r})"


_ITEM_KEYS = {"function", "state", "label"}


def _item(item: Any) -> dict[str, Any]:
    """A tell-tale of a cluster as the contract describes it."""
    if isinstance(item, TellTale):
        out = {"function": item.function, "state": item.value}
        if item.label:
            out["label"] = item.label
        return out
    if isinstance(item, (tuple, list)) and len(item) in (2, 3):
        item = dict(zip(("function", "state", "label"), item, strict=False))
    if not isinstance(item, Mapping):
        raise t.TraitError(f"a tell-tale of a TellTaleCluster is a dict, got {item!r}")
    unknown = set(item) - _ITEM_KEYS
    if unknown:
        raise t.TraitError(f"a tell-tale of a TellTaleCluster has no key(s) {sorted(unknown)}")
    if item.get("function") not in TELLTALE_FUNCTIONS:
        raise t.TraitError(f"unknown tell-tale function {item.get('function')!r}")
    if "state" not in item or (item["state"] is not None and item["state"] not in TELLTALE_STATES):
        raise t.TraitError(f"the state of a tell-tale is one of {TELLTALE_STATES} or None")
    if "label" in item and not isinstance(item["label"], str):
        raise t.TraitError("the label of a tell-tale is text")
    return dict(item)


class TellTaleCluster(AutomotiveWidget):
    """A row of tell-tales: the direction indicators first, side by side, then the lit
    ones, red, then amber, then green and blue (TEL-006, TEL-009).

    ``value`` is a list of tell-tales, each a dict ``{"function", "state",
    "label"}`` (``label`` optional), a ``(function, state)`` pair or a
    :class:`TellTale`, whose function, state and label are copied.
    ``size`` is the size of one tell-tale.
    """

    _kind = t.Unicode("awa-telltalecluster").tag(sync=True)
    value = t.List(t.Any(), default_value=[]).tag(sync=True)
    size = size_trait(56, 56)
    _default_size = (56, 56)

    def __init__(self, value: Iterable[Any] = (), **kwargs: Any) -> None:
        super().__init__(value=list(value), **kwargs)

    @t.validate("value")
    def _validate_value(self, proposal: Any) -> list[dict[str, Any]]:
        return [_item(i) for i in proposal["value"]]

    def set_telltale(self, function: str, state: str | None) -> None:
        """Set the state of every tell-tale of ``function`` in the cluster."""
        if function not in TELLTALE_FUNCTIONS:
            raise t.TraitError(f"unknown tell-tale function {function!r}")
        items = cast("list[dict[str, Any]]", self.value)
        self.value = [{**i, "state": state} if i["function"] == function else i for i in items]

    def __repr__(self) -> str:
        return f"TellTaleCluster({self.value!r})"
