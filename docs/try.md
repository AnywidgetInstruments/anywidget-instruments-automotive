# Try it in the browser

The demos are [marimo](https://marimo.io) reactive apps that run in your browser:
Python runs through Pyodide, so there is nothing to install. The first load
downloads the Python runtime and the widgets, which takes a few seconds. The
[examples](examples.md) describe each of them, with their pictures.

!!! danger "Not a vehicle instrument"
    The demos simulate vehicles for visualization and teaching. No widget is meant
    to be operated while driving; see the [safety notice](safety.md).

| Demo (marimo) | What it shows |
|---|---|
| <a href="../marimo/cluster_preview/">**Instrument cluster**</a> | A cluster with a combustion, hybrid or electric drivetrain, driven by sliders, with tell-tales, unit systems and the head-up display |
| <a href="../marimo/electric/">**Electric and hybrid**</a> | Power meters, battery gauges, power flows, an electric trip computer and the electric tell-tales |
| <a href="../marimo/dials/">**Dials**</a> | Speedometers, tachometers, fuel and temperature gauges in every unit system |
| <a href="../marimo/digital/">**Digital displays**</a> | Trip computers, odometer and gear indicators |
| <a href="../marimo/telltales/">**Tell-tales**</a> | Every tell-tale, by colour and meaning; also as a <a href="../lite/lab/index.html?path=telltales.ipynb">JupyterLite notebook</a> |

The package is not on the package index yet: the demos install the wheels built with
this site, of the anywidget-instruments core first, then of this library.
