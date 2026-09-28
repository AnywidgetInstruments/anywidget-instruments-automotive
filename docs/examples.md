# Examples

!!! info "Preview"
    The widgets below are those of anywidget-automotives, laid out by marimo until the
    `Cluster` is written; its head-up display mode is stood in for by a plain mirror.
    The figures are simulated.

## Instrument cluster

Drive with the sliders — speed, engine speed, fuel level, coolant temperature — light the
tell-tales, pick a unit system, and turn on the **HUD mirror**. The tell-tales take their
colour from their meaning (red, amber, green, blue) and move to the front when lit; the
speedometer rounds up after converting; the tachometer has its red zone and shift light;
the trip computer gives the consumption per hour below 5 km/h and per 100 km above,
and the gear indicator follows the speed.

![Instrument cluster preview, light theme](img/cluster-preview-light.png#only-light)
![Instrument cluster preview, dark theme](img/cluster-preview-dark.png#only-dark)

*The preview with the engine tell-tale (amber) and the high beam (blue) lit. The page
and the widgets follow your light or dark preference.*

<a class="md-button md-button--primary" href="../marimo/cluster_preview/">▶ Open it in your browser</a>

It runs entirely in the browser, through marimo and Pyodide: the first load downloads
Python and the widgets, which takes a few seconds.

Locally, with the marimo editor, from a clone of the repository (see
[Development](development.md)):

```bash
pip install marimo "anywidget-instruments @ git+https://github.com/s-celles/anywidget-instruments"
npm install && npm run build && pip install -e .
marimo edit lite/marimo/cluster_preview.py
```

## Tell-tales in JupyterLite

A notebook lighting the tell-tales from Python, in the browser, with no installation.

<a class="md-button" href="../lite/lab/index.html?path=telltales.ipynb">▶ Open it in JupyterLite</a>

See the [safety notice](safety.md): these are not vehicle instruments.
