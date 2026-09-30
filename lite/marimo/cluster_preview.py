# Instrument cluster preview for the marimo WebAssembly export of the documentation site.
# `marimo export html-wasm` runs it in the browser through Pyodide. Both wheels, of this
# library and of anywidget-instruments on which it builds, are published next to the page
# (public/).
#
# The page follows the reader's light or dark preference, as the widgets do; left to
# its default, marimo would draw dark widgets on a light page.
# /// script
# [tool.marimo.display]
# theme = "system"
# ///
import marimo

__generated_with = "0.25.0"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _():
    import sys

    import marimo as mo

    return mo, sys


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    [⬅ Back to the documentation](https://anywidgetinstruments.github.io/anywidget-instruments-automotive/examples/)

    # Instrument cluster

    Pick a drivetrain — combustion, hybrid or electric — move the sliders to drive, flip
    the switches to light the tell-tales, and turn on the **head-up display**. Everything
    runs in your browser.

    > **The widgets of anywidget-instruments-automotive**, in one `Cluster`: pick a unit system
    > to see them convert, and turn on the head-up display to see the cluster
    > mirrored for a windscreen, showing only the speed and what is marked for it.
    > The figures are simulated.

    > **Not a vehicle instrument.** See the
    > [safety notice](https://anywidgetinstruments.github.io/anywidget-instruments-automotive/safety/).
    """)
    return


@app.cell(hide_code=True)
async def _(mo, sys):
    # In the browser the packages are not on the package index: install the wheels built
    # with the site, anywidget-instruments first, on which the other depends. Locally
    # they are installed.
    if sys.platform == "emscripten":
        import micropip
        from pyodide.http import pyfetch

        _base = mo.notebook_location() / "public"
        for _wheel in (await (await pyfetch(str(_base / "wheels.txt"))).string()).split():
            await micropip.install(str(_base / _wheel))
    installed = True
    return (installed,)


@app.cell(hide_code=True)
def _(installed):
    assert installed
    import anywidget_instruments_automotive as aa

    return (aa,)


@app.cell(hide_code=True)
def _(mo):
    drivetrain = mo.ui.radio(
        ["combustion", "hybrid", "electric"], value="combustion", label="Drivetrain", inline=True
    )
    speed = mo.ui.slider(0, 200, value=90, step=1, label="Speed (km/h)", show_value=True)
    rpm = mo.ui.slider(0, 7000, value=2500, step=50, label="Engine speed (rpm)", show_value=True)
    power = mo.ui.slider(-60, 150, value=18, step=1, label="Electric power (kW)", show_value=True)
    fuel = mo.ui.slider(0, 100, value=35, step=1, label="Fuel or charge (%)", show_value=True)
    coolant = mo.ui.slider(40, 130, value=90, step=1, label="Coolant (°C)", show_value=True)
    units = mo.ui.dropdown(["metric", "imperial", "us"], value="metric", label="Unit system")
    mo.vstack(
        [
            mo.md("### Drive"),
            drivetrain,
            mo.hstack([speed, rpm]),
            mo.hstack([power, fuel]),
            mo.hstack([coolant, units]),
        ]
    )
    return coolant, drivetrain, fuel, power, rpm, speed, units


@app.cell(hide_code=True)
def _(mo):
    mil = mo.ui.switch(label="Engine (MIL)")
    oil = mo.ui.switch(label="Oil pressure")
    turn = mo.ui.switch(label="Direction indicator")
    high_beam = mo.ui.switch(label="High beam")
    hud = mo.ui.switch(label="Head-up display")
    mo.vstack(
        [
            mo.md("### Tell-tales and display"),
            mo.hstack([mil, oil, turn, high_beam, hud], justify="start"),
        ]
    )
    return high_beam, hud, mil, oil, turn


@app.cell(hide_code=True)
def _(drivetrain, fuel, power, rpm, speed):
    # Simulated figures: a fuel rate rising with engine speed, the engine power of a
    # hybrid from its engine speed, a gear from the speed. Enough to show how the
    # displays read, not a model of any vehicle. Consumptions are computed by the trip
    # computer itself.
    electric = drivetrain.value == "electric"
    engine_on = not electric and rpm.value > 0
    fuel_rate_lph = 0.6 + rpm.value / 1000 * 1.3 if engine_on else 0.0
    engine_kw = max(0.0, (rpm.value - 800) / 100) if engine_on else 0.0
    tops = ((1, 20), (2, 40), (3, 60), (4, 80), (5, 110))
    gear = next((g for g, top in tops if speed.value < top), 6) if not electric else "D"
    low = fuel.value < 12
    # a 50 L tank at 6 L/100 km, or a 60 kWh battery at 16 kWh/100 km
    range_km = fuel.value / 100 * (60 / 16 if electric else 50 / 6) * 100
    wheels_kw = engine_kw + power.value
    return engine_kw, fuel_rate_lph, gear, low, range_km, wheels_kw


@app.cell(hide_code=True)
def _(
    aa,
    coolant,
    drivetrain,
    engine_kw,
    fuel,
    fuel_rate_lph,
    gear,
    high_beam,
    hud,
    low,
    mil,
    oil,
    power,
    range_km,
    rpm,
    speed,
    turn,
    units,
    wheels_kw,
):
    def on(lit: bool) -> str:
        return "on" if lit else "off"

    kind = drivetrain.value
    trip = {"speed": speed.value, "distance": 42.0, "elapsed": 1860, "range": range_km}
    lamps = [
        ("oil_pressure", on(oil.value and kind != "electric")),
        ("coolant_temperature", on(coolant.value >= 115)),
        ("engine", on(mil.value and kind != "electric")),
        ("low_charge" if kind == "electric" else "low_fuel", on(low)),
        ("turn_left", "blinking" if turn.value else "off"),
        ("turn_right", "off"),
        ("high_beam", on(high_beam.value)),
    ]
    if kind != "combustion":
        lamps.append(("ready", "on"))
    tell_tales = aa.TellTaleCluster(lamps, size=(44, 44), hud=True)
    # rounded up after conversion, never down; the limit marked on the scale
    speedometer = aa.Speedometer(float(speed.value), limit=130)
    gear_indicator = aa.GearIndicator(gear if speed.value > 0 else "N", hud=True)
    if kind == "electric":
        widgets = [
            aa.PowerMeter(float(power.value), ready=True),
            tell_tales,
            speedometer,
            aa.StateOfChargeGauge(float(fuel.value)),
            aa.TemperatureGauge(float(coolant.value), hot=115),
            aa.TripComputer({**trip, "power": power.value, "energy_used": 6.9}, energy="electric"),
            gear_indicator,
        ]
    else:
        widgets = [
            aa.Tachometer(float(rpm.value), redline=6200, shift_light=5800, ready=kind == "hybrid"),
            tell_tales,
            speedometer,
            aa.FuelGauge(float(fuel.value), reserve=12, filler_side="right"),
            aa.TemperatureGauge(float(coolant.value), hot=115),
            aa.TripComputer({**trip, "fuel_rate": fuel_rate_lph, "fuel_used": 2.9}),
            gear_indicator,
        ]
        if kind == "hybrid":
            flow = {"engine": engine_kw, "battery": power.value, "wheels": wheels_kw}
            widgets[4] = aa.PowerFlow(flow)
    # One Cluster: dials on the sides, tell-tales between, displays below. Its theme,
    # unit system and head-up display mode apply to every widget it holds; in HUD mode
    # it shows the speed and the widgets marked hud=True, mirrored, on black.
    aa.Cluster(widgets, hud=hud.value, unit_system=units.value, theme="system")
    return


if __name__ == "__main__":
    app.run()
