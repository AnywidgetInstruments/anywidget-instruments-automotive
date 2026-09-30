"""Electric and hybrid drivetrains from Python (EV-001 .. EV-008)."""

from __future__ import annotations

import math

import pytest
import traitlets as t

import anywidget_instruments_automotive as aa


def test_a_state_of_charge_gauge_takes_a_charge_a_low_zone_and_a_charging_state() -> None:
    w = aa.StateOfChargeGauge(38, charging=True, low=20)
    assert (w.value, w.charging, w.low, w.max) == (38, True, 20, 100)


def test_a_power_meter_reaches_below_zero_by_default() -> None:
    """EV-003: regeneration is a negative power."""
    w = aa.PowerMeter(-23, ready=True)
    assert (w.value, w.min, w.max, w.ready) == (-23, -60, 150, True)
    assert aa.PowerMeter(1, unit="kW").unit == "kW"
    with pytest.raises(t.TraitError):
        aa.PowerMeter(1, unit="hp")


def test_a_power_flow_takes_the_powers_of_engine_battery_and_wheels() -> None:
    w = aa.PowerFlow({"engine": 38, "battery": -12, "wheels": 26})
    assert w.value == {"engine": 38.0, "battery": -12.0, "wheels": 26.0}


@pytest.mark.parametrize(
    "powers", [{"engine": -1}, {"motor": 3}, {"battery": math.inf}, {"wheels": "fast"}, [1]]
)
def test_a_power_flow_refuses_what_the_contract_does(powers: object) -> None:
    with pytest.raises(t.TraitError):
        aa.PowerFlow(powers)  # type: ignore[arg-type]


def test_an_electric_trip_takes_a_signed_power_and_energy() -> None:
    """EV-006: power and energy used are negative while regenerating."""
    w = aa.TripComputer({"speed": 60, "power": -12.5, "energy_used": -0.1}, energy="electric")
    assert w.value == {"speed": 60.0, "power": -12.5, "energy_used": -0.1}
    assert aa.TripComputer(energy="electric", unit="mi/kWh").unit == "mi/kWh"
    with pytest.raises(t.TraitError):
        aa.TripComputer({"fuel_used": -1})


def test_the_tell_tales_of_an_electric_drivetrain_are_in_the_set() -> None:
    """EV-008."""
    for f in ("ready", "charging", "low_charge", "reduced_power", "ev_fault"):
        assert f in aa.TELLTALE_FUNCTIONS


def test_a_cluster_holds_the_electric_widgets() -> None:
    c = aa.Cluster([aa.PowerMeter(10), aa.StateOfChargeGauge(50), aa.PowerFlow({"battery": 10})])
    assert [i["_kind"] for i in c.value] == [
        "awa-powermeter",
        "awa-stateofchargegauge",
        "awa-powerflow",
    ]
