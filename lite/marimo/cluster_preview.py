# Instrument cluster preview for the marimo WebAssembly export of the documentation site.
# `marimo export html-wasm` runs it in the browser through Pyodide. It is composed from
# anywidget-instruments widgets, whose wheel is published on that library's site: the
# automotive widgets themselves are not written yet.
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

    > **Preview.** This cluster is composed from **anywidget-instruments** widgets, to
    > show what anywidget-automotives will offer. The automotive widgets themselves —
    > `Speedometer`, `Tachometer`, `TellTale`, `Cluster` — are specified but not written
    > yet ([catalog](https://s-celles.github.io/anywidget-automotives/widgets/)). The
    > figures are simulated.

    > **Not a vehicle instrument.** See the
    > [safety notice](https://s-celles.github.io/anywidget-automotives/safety/).
    """)
    return


@app.cell(hide_code=True)
async def _(mo, sys):
    # In the browser the package is not on the package index: install the wheel that
    # anywidget-instruments publishes next to its own gallery. Locally it is installed.
    if sys.platform == "emscripten":
        import micropip
        from pyodide.http import pyfetch

        _base = "https://s-celles.github.io/anywidget-instruments/marimo/gallery/public/"
        _wheel = (await (await pyfetch(_base + "wheel.txt")).string()).strip()
        await micropip.install(_base + _wheel)
    installed = True
    return (installed,)


@app.cell(hide_code=True)
def _(installed):
    assert installed
    import anywidget_instruments as ai

    return (ai,)


@app.cell(hide_code=True)
def _(mo):
    speed = mo.ui.slider(0, 200, value=90, step=1, label="Speed (km/h)")
    rpm = mo.ui.slider(0, 7000, value=2500, step=50, label="Engine speed (rpm)")
    fuel = mo.ui.slider(0, 100, value=35, step=1, label="Fuel level (%)")
    coolant = mo.ui.slider(40, 130, value=90, step=1, label="Coolant (°C)")
    mo.vstack([mo.md("### Drive"), mo.hstack([speed, rpm]), mo.hstack([fuel, coolant])])
    return coolant, fuel, rpm, speed


@app.cell(hide_code=True)
def _(mo):
    mil = mo.ui.switch(label="Engine (MIL)")
    oil = mo.ui.switch(label="Oil pressure")
    turn = mo.ui.switch(label="Direction indicator")
    high_beam = mo.ui.switch(label="High beam")
    hud = mo.ui.switch(label="HUD mirror")
    mo.vstack([mo.md("### Tell-tales and display"), mo.hstack([mil, oil, turn, high_beam, hud], justify="start")])
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
def _(ai, coolant, fuel, fuel_rate_lph, high_beam, hud, low_fuel, mil, mo, oil, per_100km, rpm, speed, turn):
    # Tell-tale colours follow their meaning (UN Regulation No. 121, ISO 2575): red for
    # danger, amber for warning, green for a function on, blue for high beam.
    RED, AMBER, GREEN, BLUE = "#d32f2f", "#ffb300", "#2e7d32", "#1565c0"
    # An unlit tell-tale is a neutral dim grey, whatever its colour when lit: an unlit
    # red one must not read as a green one.
    OFF = "#3a3a3a"
    # The widgets follow the reader's light or dark preference, as the page does.
    THEME = "system"
    tell_tales = mo.hstack(
        [
            ai.LED(oil.value, label="Oil pressure", on_color=RED, off_color=OFF, theme=THEME),
            ai.LED(coolant.value >= 115, label="Coolant hot", on_color=RED, off_color=OFF, theme=THEME),
            ai.LED(mil.value, label="Engine", on_color=AMBER, off_color=OFF, theme=THEME),
            ai.LED(low_fuel, label="Low fuel", on_color=AMBER, off_color=OFF, theme=THEME),
            ai.LED(turn.value, label="Indicator", on_color=GREEN, off_color=OFF, blink=turn.value, theme=THEME),
            ai.LED(high_beam.value, label="High beam", on_color=BLUE, off_color=OFF, theme=THEME),
        ],
        justify="center",
    )
    dials = mo.hstack(
        [
            # Rounded up, never down, in the direction UN Regulation No. 39 asks of a
            # real speedometer.
            ai.Gauge(float(speed.value), min=0, max=200, unit="km/h", label="Speed", theme=THEME),
            # The tachometer's red zone, with an amber band before it.
            ai.Gauge(
                float(rpm.value),
                min=0,
                max=7000,
                unit="rpm",
                label="Engine speed",
                ranges=[{"from": 5500, "to": 6200, "color": AMBER}, {"from": 6200, "to": 7000, "color": RED}],
                theme=THEME,
            ),
        ],
        justify="center",
    )
    gauges = mo.hstack(
        [
            ai.Tank(float(fuel.value), min=0, max=100, unit="%", label="Fuel", lo=12, show_limits=True, theme=THEME),
            ai.Thermometer(float(coolant.value), min=40, max=130, unit="°C", label="Coolant", hi=110, hihi=115, theme=THEME),
        ],
        justify="center",
    )
    trip = mo.hstack(
        [
            ai.SevenSegment(fuel_rate_lph, digits=4, decimals=1, unit="L/h", label="Fuel rate", theme=THEME),
            ai.SevenSegment(
                per_100km if per_100km is not None else 0.0,
                digits=4,
                decimals=1,
                unit="L/100 km",
                label="Instant consumption" if per_100km is not None else "L/100 km (below 5 km/h: —)",
                theme=THEME,
            ),
        ],
        justify="center",
    )
    cluster = mo.vstack([tell_tales, dials, gauges, trip])
    # The HUD mirror flips the cluster on black, for a reflection in the windscreen.
    hud_style = {"transform": "scaleX(-1)", "background": "#000", "padding": "16px", "border-radius": "8px"}
    cluster.style(hud_style) if hud.value else cluster
    return


if __name__ == "__main__":
    app.run()
