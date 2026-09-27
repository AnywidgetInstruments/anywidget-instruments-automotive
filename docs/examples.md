# Examples

!!! info "Preview"
    The automotive widgets are not written yet. The example below is composed from
    [anywidget-instruments](https://s-celles.github.io/anywidget-instruments/) widgets, to
    show what anywidget-automotives will offer; it is replaced widget by widget as the
    real ones arrive. The figures are simulated.

## Instrument cluster

Drive with the sliders — speed, engine speed, fuel level, coolant temperature — light the
tell-tales, and turn on the **HUD mirror**. The tell-tales take the colours of UN
Regulation No. 121 (red, amber, green, blue); the tachometer has its red zone; the trip
computer gives the consumption per hour below 5 km/h and per 100 km above.

<a class="md-button md-button--primary" href="../marimo/cluster_preview/">▶ Open it in your browser</a>

It runs entirely in the browser, through marimo and Pyodide: the first load downloads
Python and the widgets, which takes a few seconds.

Locally, with the marimo editor:

```bash
pip install marimo "anywidget-instruments @ git+https://github.com/s-celles/anywidget-instruments"
marimo edit lite/marimo/cluster_preview.py
```

See the [safety notice](safety.md): these are not vehicle instruments.
