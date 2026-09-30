# Dials — a marimo notebook of the documentation site, exported to
# WebAssembly: it runs in the browser through Pyodide, with the wheels of this library and of
# anywidget-instruments published next to the page (public/). Locally, with the
# packages installed: `marimo edit lite/marimo/dials.py`.
#
# The page follows the reader's light or dark preference, as the widgets do.
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
    [⬅ Back to the documentation](https://anywidgetinstruments.github.io/anywidget-instruments-automotive/widgets/#dials)

    # Dials

    Drive the speedometer, tachometer, fuel and temperature gauges. The speed is rounded up
    after conversion, never down; the limit is marked on the scale; the shift light comes on
    at 5800 rpm; the hybrid switch shows READY on a stopped engine.

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
    theme = mo.ui.radio(["day", "night"], value="day", label="Theme", inline=True)
    units = mo.ui.dropdown(["metric", "imperial", "us"], value="metric", label="Unit system")
    mo.hstack([theme, units], justify="start")
    return theme, units


@app.cell(hide_code=True)
def _(mo):
    speed = mo.ui.slider(0, 240, value=87, step=0.5, label="Speed (km/h)", show_value=True)
    limit = mo.ui.slider(30, 130, value=90, step=10, label="Limit (km/h)", show_value=True)
    rpm = mo.ui.slider(0, 7500, value=2600, step=50, label="Engine speed (rpm)", show_value=True)
    fuel = mo.ui.slider(0, 100, value=38, step=1, label="Fuel (%)", show_value=True)
    coolant = mo.ui.slider(30, 135, value=90, step=1, label="Coolant (°C)", show_value=True)
    ready = mo.ui.switch(label="Hybrid, ready")
    mo.vstack([mo.hstack([speed, limit]), mo.hstack([rpm, ready]), mo.hstack([fuel, coolant])])
    return coolant, fuel, limit, ready, rpm, speed


@app.cell(hide_code=True)
def _(aa, coolant, fuel, limit, mo, ready, rpm, speed, theme, units):
    common = {"theme": theme.value, "unit_system": units.value}
    mo.hstack(
        [
            aa.Speedometer(speed.value, limit=limit.value, **common),
            aa.Tachometer(rpm.value, redline=6200, shift_light=5800, ready=ready.value, **common),
            aa.FuelGauge(fuel.value, filler_side="right", **common),
            aa.TemperatureGauge(coolant.value, **common),
        ],
        justify="center",
        wrap=True,
    )
    return


if __name__ == "__main__":
    app.run()
