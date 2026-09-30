"""The Cluster from Python (CLU, HUD, DIS-001, UNIT-004)."""

from __future__ import annotations

import pytest
import traitlets as t

import anywidget_instruments_automotive as aa


def test_a_cluster_holds_the_traits_of_its_widgets() -> None:
    speed = aa.Speedometer(87.3, limit=90)
    c = aa.Cluster([speed, aa.TellTale("engine", "on")])
    kinds = [i["_kind"] for i in c.value]
    assert kinds == ["awa-speedometer", "awa-telltale"]
    assert c.value[0]["value"] == 87.3
    assert c.value[0]["limit"] == 90


def test_the_items_carry_no_framework_trait_and_no_liveness_of_their_own() -> None:
    item = aa.Cluster([aa.Speedometer(1)]).value[0]
    for name in ("_esm", "_css", "layout", "_model_name", "_session", "_heartbeat"):
        assert name not in item


def test_a_change_to_a_widget_shows_in_the_cluster() -> None:
    speed = aa.Speedometer(50)
    c = aa.Cluster([speed])
    speed.value = 60
    assert c.value[0]["value"] == 60


def test_a_widget_taken_out_no_longer_updates_the_cluster() -> None:
    speed, rpm = aa.Speedometer(50), aa.Tachometer(900)
    c = aa.Cluster([speed, rpm])
    c.children = [rpm]
    speed.value = 70
    assert [i["_kind"] for i in c.value] == ["awa-tachometer"]


def test_a_trait_dictionary_is_held_as_given() -> None:
    c = aa.Cluster([{"_kind": "awa-gearindicator", "value": "D"}])
    assert c.value == [{"_kind": "awa-gearindicator", "value": "D"}]


@pytest.mark.parametrize(
    "child", [{"_kind": "awa-hovercraft"}, {"value": 3}, "speed", aa.Cluster()]
)
def test_a_cluster_refuses_what_it_cannot_draw(child: object) -> None:
    with pytest.raises(t.TraitError):
        aa.Cluster([child])  # type: ignore[list-item]


def test_hud_theme_brightness_and_unit_system_are_traits_of_the_cluster() -> None:
    """CLU-002, UNIT-004: the front end applies them to every widget held."""
    c = aa.Cluster([aa.Speedometer(1)], hud=True, theme="dark", brightness=0.5, unit_system="us")
    assert (c.hud, c.theme, c.brightness, c.unit_system) == (True, "dark", 0.5, "us")
    with pytest.raises(t.TraitError):
        aa.Cluster(brightness=0)


def test_a_widget_is_marked_for_the_head_up_display_by_its_hud_trait() -> None:
    """HUD-004."""
    c = aa.Cluster([aa.GearIndicator(4, hud=True)], hud=True)
    assert c.value[0]["hud"] is True


def test_max_items_is_unset_by_default() -> None:
    """DIS-001: the front end then shows eight."""
    assert aa.Cluster().max_items is None
    with pytest.raises(t.TraitError):
        aa.Cluster(max_items=0)


def test_a_widget_that_was_never_displayed_can_be_held() -> None:
    """Its framework traits, which need a live comm to serialize, are left out."""
    speed = aa.Speedometer(1)
    speed.comm = None
    c = aa.Cluster([speed])
    speed.value = 2
    assert c.value[0]["value"] == 2
