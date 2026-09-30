"""The dials from Python (DIAL, SPD): the binding sets traits, the front end converts."""

from __future__ import annotations

import math

import pytest
import traitlets as t

import anywidget_instruments_automotive as aa


def test_a_speedometer_passes_its_value_unconverted() -> None:
    """GEN-004: km/h in, whatever the unit system; the front end converts."""
    w = aa.Speedometer(87.3, unit_system="us", limit=90)
    assert (w.value, w.unit_system, w.limit, w.unit, w.input_unit) == (87.3, "us", 90, "", "")


def test_a_dial_without_a_value_has_none_rather_than_zero() -> None:
    """ROB-002."""
    assert aa.Tachometer().value is None


def test_a_non_finite_value_travels_as_text() -> None:
    """JSON has no NaN: the front end shows it invalid (DIAL-004)."""
    w = aa.Speedometer(math.nan)
    assert w.get_state()["value"] == "nan"


@pytest.mark.parametrize(
    ("cls", "unit"),
    [
        (aa.Speedometer, "°F"),
        (aa.TemperatureGauge, "mph"),
        (aa.FuelGauge, "L"),
        (aa.Tachometer, "Hz"),
    ],
)
def test_a_unit_of_another_quantity_is_refused(cls: type, unit: str) -> None:
    """UNIT-017: the unit names come from the contract, by quantity."""
    with pytest.raises(t.TraitError):
        cls(1, unit=unit)


def test_the_units_of_a_quantity_are_those_of_the_contract() -> None:
    assert aa.Speedometer(1, unit="mph").unit == "mph"
    assert aa.TemperatureGauge(1, unit="°F", input_unit="°C").unit == "°F"


@pytest.mark.parametrize(
    "zone",
    [
        {"from": 0, "to": 10},
        {"from": 0, "to": 10, "kind": "pink"},
        {"from": 0, "to": "10", "kind": "danger"},
        {"from": 0, "to": math.inf, "kind": "danger"},
        {"from": 0, "to": 10, "kind": "danger", "color": "red"},
    ],
)
def test_a_zone_outside_the_contract_is_refused(zone: object) -> None:
    with pytest.raises(t.TraitError):
        aa.Speedometer(1, zones=[zone])


def test_a_zone_is_kept_as_given() -> None:
    w = aa.TemperatureGauge(90, zones=[{"from": 100, "to": 110, "kind": "warning"}])
    assert w.zones == [{"from": 100.0, "to": 110.0, "kind": "warning"}]


@pytest.mark.parametrize("resolution", [0, -1, math.nan])
def test_the_resolution_is_positive(resolution: float) -> None:
    with pytest.raises(t.TraitError):
        aa.Speedometer(1, resolution=resolution)


def test_each_dial_has_the_defaults_of_the_catalog() -> None:
    assert (aa.Speedometer().max, aa.Speedometer().label) == (220, "Speed")
    assert (aa.Tachometer().max, aa.Tachometer().redline) == (7000, None)
    assert (aa.FuelGauge().reserve, aa.FuelGauge().filler_side) == (12, "")
    assert (aa.TemperatureGauge().cold, aa.TemperatureGauge().hot) == (60, 115)


def test_the_filler_side_is_left_or_right() -> None:
    with pytest.raises(t.TraitError):
        aa.FuelGauge(50, filler_side="rear")
