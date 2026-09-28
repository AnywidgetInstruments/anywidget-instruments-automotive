"""The tell-tales from Python (TEL-001 .. TEL-008): the binding sets traits only."""

from __future__ import annotations

import pytest
import traitlets as t

import anywidget_automotives as aa


def test_a_tell_tale_takes_its_function_and_its_state() -> None:
    w = aa.TellTale("oil_pressure", "on")
    assert (w.function, w.value, w.state) == ("oil_pressure", "on", "on")


def test_a_tell_tale_without_a_state_has_none_rather_than_off() -> None:
    """ROB-002: a tell-tale never set is shown as no value."""
    assert aa.TellTale("engine").value is None


def test_the_state_is_an_alias_of_the_value() -> None:
    w = aa.TellTale("abs")
    w.state = "blinking"
    assert w.value == "blinking"


@pytest.mark.parametrize("state", ["lit", "ON", 1, True])
def test_an_unknown_state_is_refused(state: object) -> None:
    with pytest.raises(t.TraitError):
        aa.TellTale("abs", state)  # type: ignore[arg-type]


def test_an_unknown_function_is_refused() -> None:
    with pytest.raises(t.TraitError):
        aa.TellTale("warp_drive", "on")


def test_the_functions_are_read_from_the_schema() -> None:
    assert "high_beam" in aa.TELLTALE_FUNCTIONS
    assert aa.TELLTALE_STATES == ("off", "on", "blinking")


def test_setting_an_unchanged_value_counts_as_an_update() -> None:
    """ROB-001: max_age counts from the last update, not the last change."""
    w = aa.TellTale("engine", "on", max_age=2)
    seq = w._value_seq
    w.value = "on"
    assert w._value_seq == seq + 1


def test_a_cluster_accepts_dicts_pairs_and_tell_tales() -> None:
    c = aa.TellTaleCluster(
        [
            ("engine", "on"),
            {"function": "abs", "state": None},
            aa.TellTale("brake", "off", label="Handbrake"),
        ]
    )
    assert c.value == [
        {"function": "engine", "state": "on"},
        {"function": "abs", "state": None},
        {"function": "brake", "state": "off", "label": "Handbrake"},
    ]


@pytest.mark.parametrize(
    "item",
    [
        {"function": "engine"},
        {"function": "engine", "state": "lit"},
        {"function": "nope", "state": "on"},
        {"function": "engine", "state": "on", "colour": "blue"},
        {"function": "engine", "state": "on", "label": 3},
        "engine",
    ],
)
def test_a_cluster_refuses_an_item_outside_the_contract(item: object) -> None:
    with pytest.raises(t.TraitError):
        aa.TellTaleCluster([item])


def test_set_telltale_sets_every_tell_tale_of_a_function() -> None:
    """Not named set_state: that name belongs to the widget protocol of ipywidgets."""
    c = aa.TellTaleCluster([("turn_left", "off"), ("engine", "off")])
    c.set_telltale("turn_left", "blinking")
    assert c.value[0]["state"] == "blinking"
    assert c.value[1]["state"] == "off"
    with pytest.raises(t.TraitError):
        c.set_telltale("nope", "on")
