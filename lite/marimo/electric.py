# Electric and hybrid — a marimo notebook of the documentation site, exported to
# WebAssembly: it runs in the browser through Pyodide, with the wheels of this library and of
# anywidget-instruments published next to the page (public/). Locally, with the
# packages installed: `marimo edit lite/marimo/electric.py`.
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
    [⬅ Back to the documentation](https://s-celles.github.io/anywidget-automotives/widgets/#electric-and-hybrid-drivetrains)

    # Electric and hybrid

    The indicators of an electric or hybrid drivetrain: the power meter reads below zero
    while regenerating, the battery gauge lights its symbol when low and says when it is
    charging, the power flow shows where the power goes, and the trip computer gives the
    energy consumption.

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
    engine = mo.ui.slider(0, 80, value=0, step=1, label="Engine (kW)", show_value=True)
    battery = mo.ui.slider(
        -40, 80, value=18, step=1, label="Battery (kW, < 0 charging)", show_value=True
    )
    soc = mo.ui.slider(0, 100, value=64, step=1, label="State of charge (%)", show_value=True)
    speed = mo.ui.slider(0, 160, value=72, step=1, label="Speed (km/h)", show_value=True)
    charging = mo.ui.switch(label="Charging")
    ready = mo.ui.switch(value=True, label="Ready")
    mo.vstack([mo.hstack([engine, battery]), mo.hstack([soc, speed]), mo.hstack([charging, ready])])
    return battery, charging, engine, ready, soc, speed


@app.cell(hide_code=True)
def _(aa, battery, charging, engine, mo, ready, soc, speed, theme, units):
    # the wheels get what the engine and the battery deliver; a negative sum is
    # braking with regeneration
    wheels = engine.value + battery.value
    common = {"theme": theme.value, "unit_system": units.value}
    mo.vstack(
        [
            mo.hstack(
                [
                    aa.PowerMeter(wheels, ready=ready.value, **common),
                    aa.StateOfChargeGauge(soc.value, charging=charging.value, **common),
                    aa.PowerFlow(
                        {"engine": engine.value, "battery": battery.value, "wheels": wheels},
                        theme=theme.value,
                    ),
                ],
                justify="center",
                wrap=True,
            ),
            mo.hstack(
                [
                    aa.TripComputer(
                        {
                            "speed": speed.value,
                            "power": battery.value,
                            "distance": 62.4,
                            "energy_used": 10.3,
                            "elapsed": 2710,
                            "range": soc.value * 4.4,
                        },
                        energy="electric",
                        **common,
                    ),
                    aa.TellTaleCluster(
                        [
                            ("ready", "on" if ready.value else "off"),
                            ("charging", "on" if charging.value else "off"),
                            ("low_charge", "on" if soc.value <= 15 else "off"),
                            ("reduced_power", "on" if soc.value <= 5 else "off"),
                            ("ev_fault", "off"),
                        ],
                        theme=theme.value,
                    ),
                ],
                justify="center",
                wrap=True,
            ),
        ]
    )
    return


if __name__ == "__main__":
    app.run()
