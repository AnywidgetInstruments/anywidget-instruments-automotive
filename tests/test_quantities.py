"""Quantities of pint, passed on as a number in input_unit (UNIT-018)."""

from __future__ import annotations

import pytest
import traitlets as t

import anywidget_instruments_automotive as aa
from anywidget_instruments_automotive._contract import UNITS
from anywidget_instruments_automotive._quantities import PINT_UNITS

pint = pytest.importorskip("pint")
u = pint.UnitRegistry()


def test_a_speed_is_given_to_the_front_end_in_km_h() -> None:
    assert aa.Speedometer(u.Quantity(50, "mile / hour")).value == pytest.approx(80.4672)


def test_a_quantity_follows_the_input_unit() -> None:
    w = aa.Speedometer(u.Quantity(80.4672, "km/hour"), input_unit="mph")
    assert w.value == pytest.approx(50)
    w.value = u.Quantity(30, "m/s")
    assert w.value == pytest.approx(30 * 3.6 / 1.609344)


def test_limits_accept_quantities_too() -> None:
    w = aa.TemperatureGauge(u.Quantity(194, "degF"), hot=u.Quantity(239, "degF"))
    assert (w.value, w.hot) == (pytest.approx(90), pytest.approx(115))


def test_a_quantity_of_another_dimension_is_refused() -> None:
    with pytest.raises(t.TraitError):
        aa.Speedometer(u.Quantity(3, "liter"))


def test_the_front_end_receives_a_number() -> None:
    state = aa.FuelGauge(u.Quantity(40, "percent")).get_state()
    assert state["value"] == pytest.approx(40)


def test_every_linear_unit_of_the_contract_has_a_pint_name_pint_knows() -> None:
    economy = {"L/100 km", "mpg (imperial)", "mpg (US)", "km/L", "kWh/100 km", "mi/kWh", "km/kWh"}
    assert set(PINT_UNITS) == set(UNITS) - economy
    for name in PINT_UNITS.values():
        u.Unit(name)


def test_the_gallons_of_pint_are_the_gallons_of_the_contract() -> None:
    """UNIT-011: 1 US gal = 3.785411784 L, 1 imperial gal = 4.54609 L."""
    assert u.Quantity(1, PINT_UNITS["US gal"]).to("liter").magnitude == pytest.approx(
        3.785411784, rel=1e-12
    )
    assert u.Quantity(1, PINT_UNITS["imperial gal"]).to("liter").magnitude == pytest.approx(
        4.54609, rel=1e-12
    )
