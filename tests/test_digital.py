"""The digital displays from Python (DIG-001 .. DIG-007)."""

from __future__ import annotations

import math

import pytest
import traitlets as t

import anywidget_automotives as aa


def test_a_trip_computer_takes_the_raw_figures_of_a_trip() -> None:
    """GEN-004: the consumptions are the front end's, from these figures."""
    w = aa.TripComputer({"speed": 90, "fuel_rate": 5.4, "distance": 45, "fuel_used": 3.15})
    assert w.value == {"speed": 90.0, "fuel_rate": 5.4, "distance": 45.0, "fuel_used": 3.15}


def test_update_keeps_the_other_figures() -> None:
    w = aa.TripComputer({"distance": 1.0})
    w.update(speed=30, fuel_rate=None)
    assert w.value == {"distance": 1.0, "speed": 30.0, "fuel_rate": None}


@pytest.mark.parametrize(
    "trip", [{"speed": -1}, {"speed": math.nan}, {"speed": "fast"}, {"odometer": 3}, [1, 2]]
)
def test_a_trip_outside_the_contract_is_refused(trip: object) -> None:
    with pytest.raises(t.TraitError):
        aa.TripComputer(trip)  # type: ignore[arg-type]


def test_a_trip_computer_takes_an_economy_unit() -> None:
    assert aa.TripComputer(unit="mpg (imperial)").unit == "mpg (imperial)"
    with pytest.raises(t.TraitError):
        aa.TripComputer(unit="mpg")


def test_an_odometer_takes_a_total_and_a_trip_in_km() -> None:
    w = aa.Odometer(48213.7, trip=48.36)
    assert (w.value, w.trip, w.unit, w.digits) == (48213.7, 48.36, "", 6)


@pytest.mark.parametrize(("given", "shown"), [("D", "D"), ("R", "R"), (3, "3"), ("8", "8")])
def test_a_gear_indicator_takes_a_letter_or_a_number(given: str | int, shown: str) -> None:
    assert aa.GearIndicator(given).value == shown


@pytest.mark.parametrize("gear", ["9", 0, "Z", True])
def test_an_unknown_gear_is_refused(gear: object) -> None:
    with pytest.raises(t.TraitError):
        aa.GearIndicator(gear)  # type: ignore[arg-type]


def test_a_shift_suggestion_is_up_or_down() -> None:
    assert aa.GearIndicator(3, suggestion="up").suggestion == "up"
    with pytest.raises(t.TraitError):
        aa.GearIndicator(3, suggestion="left")
