# Instrument cluster preview for the marimo WebAssembly export of the documentation site.
# `marimo export html-wasm` runs it in the browser through Pyodide. The tell-tales and
# dials are the widgets of anywidget-automotives; the trip computer, not written yet, is
# still made of anywidget-instruments widgets. Both wheels are published next to the page
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
    [⬅ Back to the documentation](https://s-celles.github.io/anywidget-automotives/examples/)

    # Instrument cluster — preview

    Move the sliders to drive, flip the switches to light the tell-tales, and turn on
    the **HUD mirror**. Everything runs in your browser.

    > **Preview.** The tell-tales and the dials are the widgets of
    > anywidget-automotives; pick a unit system to see them convert. The trip computer
    > is still made of **anywidget-instruments** widgets, standing in for
    > `TripComputer`, which is specified but not written yet
    > ([catalog](https://s-celles.github.io/anywidget-automotives/widgets/)). The
    > figures are simulated.

    > **Not a vehicle instrument.** See the
    > [safety notice](https://s-celles.github.io/anywidget-automotives/safety/).
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
    import anywidget_instruments as ai

    import anywidget_automotives as aa

    return aa, ai


@app.cell(hide_code=True)
def _(mo):
    speed = mo.ui.slider(0, 200, value=90, step=1, label="Speed (km/h)")
    rpm = mo.ui.slider(0, 7000, value=2500, step=50, label="Engine speed (rpm)")
    fuel = mo.ui.slider(0, 100, value=35, step=1, label="Fuel level (%)")
    coolant = mo.ui.slider(40, 130, value=90, step=1, label="Coolant (°C)")
    units = mo.ui.dropdown(["metric", "imperial", "us"], value="metric", label="Unit system")
    mo.vstack([mo.md("### Drive"), mo.hstack([speed, rpm]), mo.hstack([fuel, coolant]), units])
    return coolant, fuel, rpm, speed, units


@app.cell(hide_code=True)
def _(mo):
    mil = mo.ui.switch(label="Engine (MIL)")
    oil = mo.ui.switch(label="Oil pressure")
    turn = mo.ui.switch(label="Direction indicator")
    high_beam = mo.ui.switch(label="High beam")
    hud = mo.ui.switch(label="HUD mirror")
    mo.vstack(
        [
            mo.md("### Tell-tales and display"),
            mo.hstack([mil, oil, turn, high_beam, hud], justify="start"),
        ]
    )
    return high_beam, hud, mil, oil, turn


@app.cell(hide_code=True)
def _(fuel, rpm, speed):
    # A simulated fuel rate, rising with engine speed: enough to show how the trip
    # computer reads, not a model of any engine.
    fuel_rate_lph = 0.6 + rpm.value / 1000 * 1.3 if rpm.value > 0 else 0.0
    # Per 100 km only above 5 km/h, where it would otherwise tend to infinity.
    per_100km = fuel_rate_lph / speed.value * 100 if speed.value >= 5 else None
    low_fuel = fuel.value < 12
    return fuel_rate_lph, low_fuel, per_100km


@app.cell(hide_code=True)
def _(
    aa,
    ai,
    coolant,
    fuel,
    fuel_rate_lph,
    high_beam,
    hud,
    low_fuel,
    mil,
    mo,
    oil,
    per_100km,
    rpm,
    speed,
    turn,
    units,
):
    # The widgets follow the reader's light or dark preference, as the page does.
    THEME = "system"

    # The TellTaleCluster takes each colour from the function (red for danger, amber
    # for warning, green for a function on, blue for the main beam), draws an unlit
    # one in a neutral grey, and puts the lit ones first.
    def on(lit: bool) -> str:
        return "on" if lit else "off"

    tell_tales = mo.hstack(
        [
            aa.TellTaleCluster(
                [
                    ("oil_pressure", on(oil.value)),
                    ("coolant_temperature", on(coolant.value >= 115)),
                    ("engine", on(mil.value)),
                    ("low_fuel", on(low_fuel)),
                    ("turn_left", "blinking" if turn.value else "off"),
                    ("high_beam", on(high_beam.value)),
                ],
                theme=THEME,
            )
        ],
        justify="center",
    )
    dials = mo.hstack(
        [
            # Rounded up after conversion, never down; the limit marked on the scale.
            aa.Speedometer(
                float(speed.value), max=220, limit=130, unit_system=units.value, theme=THEME
            ),
            aa.Tachometer(float(rpm.value), redline=6200, shift_light=5800, theme=THEME),
        ],
        justify="center",
    )
    gauges = mo.hstack(
        [
            aa.FuelGauge(float(fuel.value), reserve=12, filler_side="right", theme=THEME),
            aa.TemperatureGauge(
                float(coolant.value), hot=115, unit_system=units.value, theme=THEME
            ),
        ],
        justify="center",
    )
    trip = mo.hstack(
        [
            ai.SevenSegment(
                fuel_rate_lph, digits=4, decimals=1, unit="L/h", label="Fuel rate", theme=THEME
            ),
            ai.SevenSegment(
                per_100km if per_100km is not None else 0.0,
                digits=4,
                decimals=1,
                unit="L/100 km",
                label="Instant consumption"
                if per_100km is not None
                else "L/100 km (below 5 km/h: —)",
                theme=THEME,
            ),
        ],
        justify="center",
    )
    cluster = mo.vstack([tell_tales, dials, gauges, trip])
    # The HUD mirror flips the cluster on black, for a reflection in the windscreen.
    hud_style = {
        "transform": "scaleX(-1)",
        "background": "#000",
        "padding": "16px",
        "border-radius": "8px",
    }
    cluster.style(hud_style) if hud.value else cluster
    return


if __name__ == "__main__":
    app.run()
