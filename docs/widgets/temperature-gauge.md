# TemperatureGauge

[![A temperature gauge at 90 °C, cold and hot zones, day theme](../img/widgets/temperature-gauge-light.png#only-light)![A temperature gauge at 90 °C, cold and hot zones, night theme](../img/widgets/temperature-gauge-dark.png#only-dark)](../../marimo/dials/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

Coolant or oil temperature, with a cold zone below `cold` and a hot zone from `hot`,
where the temperature tell-tale lights red (DIAL-107, DIAL-108). °C, or °F in the `us`
unit system.

```python
aa.TemperatureGauge(118, hot=115)       # in the hot zone: the tell-tale lit red
aa.TemperatureGauge(90, unit_system="us")  # 194 °F
```

[![Fuel and temperature gauges, day theme](../img/gauges-light.png#only-light)![Fuel and temperature gauges, night theme](../img/gauges-dark.png#only-dark)](../../marimo/dials/ "Open it in marimo, in your browser")

**Dials** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
