# Tell-tales — a marimo notebook of the documentation site, exported to
# WebAssembly: it runs in the browser through Pyodide, with the wheels of this library and of
# anywidget-instruments published next to the page (public/). Locally, with the
# packages installed: `marimo edit lite/marimo/telltales.py`.
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
    [⬅ Back to the documentation](https://s-celles.github.io/anywidget-instruments-automotive/widgets/#tell-tales)

    # Tell-tales

    Pick the tell-tales to light and to blink. Each takes its colour from its function —
    red for a danger, amber for a warning, green for a function on, blue for the main beam —
    whatever the theme, and the lit ones come first in the row.

    > **Not a vehicle instrument.** See the
    > [safety notice](https://s-celles.github.io/anywidget-instruments-automotive/safety/).
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
def _(aa, mo):
    lit = mo.ui.multiselect(
        options=list(aa.TELLTALE_FUNCTIONS),
        value=["engine", "low_beam", "oil_pressure", "ready"],
        label="Lit",
    )
    blinking = mo.ui.multiselect(options=list(aa.TELLTALE_FUNCTIONS), value=[], label="Blinking")
    mo.hstack([lit, blinking], justify="start")
    return blinking, lit


@app.cell(hide_code=True)
def _(aa, blinking, lit, theme):
    def state(f: str) -> str:
        return "blinking" if f in blinking.value else "on" if f in lit.value else "off"

    aa.TellTaleCluster(
        [(f, state(f)) for f in aa.TELLTALE_FUNCTIONS],
        size=(48, 48),
        label="Every tell-tale",
        theme=theme.value,
    )
    return


if __name__ == "__main__":
    app.run()
