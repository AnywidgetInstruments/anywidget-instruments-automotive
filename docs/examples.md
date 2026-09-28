# Examples

Every example is a [marimo](https://marimo.io) notebook that runs in your browser,
through Pyodide, with no installation: click a picture or its button. The first load
downloads Python and the widgets, which takes a few seconds.

## Instrument cluster

Pick a drivetrain — combustion, hybrid or electric — and drive with the sliders: speed,
engine speed, electric power, fuel or charge, coolant temperature. Light the
tell-tales, pick a unit system, and turn on the **head-up display**. The tell-tales take their
colour from their meaning (red, amber, green, blue) and move to the front when lit; the
speedometer rounds up after converting; the tachometer has its red zone and shift light;
the trip computer gives the consumption per hour below 5 km/h and per 100 km above,
and the gear indicator follows the speed.

[![Instrument cluster preview, light theme](img/cluster-preview-light.png#only-light)![Instrument cluster preview, dark theme](img/cluster-preview-dark.png#only-dark)](../marimo/cluster_preview/ "Open it in marimo, in your browser")

*The cluster of a combustion car, with the engine tell-tale (amber) and the high beam
(blue) lit. The page and the widgets follow your light or dark preference.*

<a class="md-button md-button--primary" href="../marimo/cluster_preview/">▶ Open it in your browser</a>

## Electric and hybrid

A power meter reading below zero while regenerating, a battery gauge that lights its
symbol when low and says when it charges, the power flow of a hybrid drivetrain — engine,
battery, wheels — and the energy consumption of the trip computer.

[![Power meters and battery gauges, light theme](img/electric-light.png#only-light)![Power meters and battery gauges, dark theme](img/electric-dark.png#only-dark)](../marimo/electric/ "Open it in marimo, in your browser")

[![Power flows, an electric trip computer and the electric tell-tales, light theme](img/hybrid-light.png#only-light)![Power flows, an electric trip computer and the electric tell-tales, dark theme](img/hybrid-dark.png#only-dark)](../marimo/electric/ "Open it in marimo, in your browser")

<a class="md-button md-button--primary" href="../marimo/electric/">▶ Open it in your browser</a>

## Dials

The speedometer, tachometer, fuel and temperature gauges, with a speed limit, a shift
light, a hybrid's ready state, a unit system and the day and night themes.

[![Speedometers, light theme](img/speedometer-light.png#only-light)![Speedometers, dark theme](img/speedometer-dark.png#only-dark)](../marimo/dials/ "Open it in marimo, in your browser")

<a class="md-button" href="../marimo/dials/">▶ Open it in your browser</a>

## Digital displays

The trip computer, from the raw figures of a trip, the odometer and the gear indicator.

[![Trip computers, odometer and gear indicators, light theme](img/digital-light.png#only-light)![Trip computers, odometer and gear indicators, dark theme](img/digital-dark.png#only-dark)](../marimo/digital/ "Open it in marimo, in your browser")

<a class="md-button" href="../marimo/digital/">▶ Open it in your browser</a>

## Tell-tales

Every tell-tale, lit or blinking at will.

[![Every tell-tale, light theme](img/telltale-functions-light.png#only-light)![Every tell-tale, dark theme](img/telltale-functions-dark.png#only-dark)](../marimo/telltales/ "Open it in marimo, in your browser")

<a class="md-button" href="../marimo/telltales/">▶ Open it in your browser</a>

## Locally

With the marimo editor, from a clone of the repository (see
[Development](development.md)):

```bash
pip install marimo "anywidget-instruments @ git+https://github.com/s-celles/anywidget-instruments"
npm install && npm run build && pip install -e .
marimo edit lite/marimo/electric.py
```

## Tell-tales in JupyterLite

A notebook lighting the tell-tales from Python, in the browser, with no installation.

<a class="md-button" href="../lite/lab/index.html?path=telltales.ipynb">▶ Open it in JupyterLite</a>

See the [safety notice](safety.md): these are not vehicle instruments.
