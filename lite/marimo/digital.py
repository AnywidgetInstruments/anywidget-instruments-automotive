# Digital displays — a marimo notebook of the documentation site, exported to
# WebAssembly: it runs in the browser through Pyodide, with the wheels of this library and of
# anywidget-instruments published next to the page (public/). Locally, with the
# packages installed: `marimo edit lite/marimo/digital.py`.
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
    [⬅ Back to the documentation](https://s-celles.github.io/anywidget-automotives/widgets/#digital-displays)

    # Digital displays

    The trip computer computes its figures from the raw figures of a trip: below 5 km/h it
    gives the consumption per hour, and no average before 0.1 km. The odometer never rounds a
    distance up; the gear indicator shows a shift suggestion.

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
    import anywidget_automotives as aa

    return (aa,)


@app.cell(hide_code=True)
def _(mo):
    theme = mo.ui.radio(["day", "night"], value="day", label="Theme", inline=True)
    units = mo.ui.dropdown(["metric", "imperial", "us"], value="metric", label="Unit system")
    mo.hstack([theme, units], justify="start")
    return theme, units


@app.cell(hide_code=True)
def _(mo):
    speed = mo.ui.slider(0, 180, value=92, step=1, label="Speed (km/h)", show_value=True)
    rate = mo.ui.slider(0, 20, value=5.6, step=0.1, label="Fuel rate (L/h)", show_value=True)
    distance = mo.ui.slider(0, 300, value=48.3, step=0.01, label="Distance (km)", show_value=True)
    used = mo.ui.slider(0, 25, value=3.1, step=0.01, label="Fuel used (L)", show_value=True)
    gear = mo.ui.dropdown(
        ["P", "R", "N", "D", "1", "2", "3", "4", "5", "6"], value="3", label="Gear"
    )
    suggestion = mo.ui.radio(["", "up", "down"], value="up", label="Suggestion", inline=True)
    mo.vstack(
        [mo.hstack([speed, rate]), mo.hstack([distance, used]), mo.hstack([gear, suggestion])]
    )
    return distance, gear, rate, speed, suggestion, used


@app.cell(hide_code=True)
def _(aa, distance, gear, mo, rate, speed, suggestion, theme, units, used):
    trip = {
        "speed": speed.value,
        "fuel_rate": rate.value,
        "distance": distance.value,
        "fuel_used": used.value,
        "elapsed": distance.value / 60 * 3600,
        "range": 420,
    }
    mo.hstack(
        [
            aa.TripComputer(trip, unit_system=units.value, theme=theme.value),
            aa.Odometer(
                48165.4 + distance.value,
                trip=distance.value,
                unit_system=units.value,
                theme=theme.value,
            ),
            aa.GearIndicator(gear.value, suggestion=suggestion.value, theme=theme.value),
        ],
        justify="center",
        wrap=True,
    )
    return


if __name__ == "__main__":
    app.run()
