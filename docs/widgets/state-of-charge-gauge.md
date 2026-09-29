# StateOfChargeGauge

[![A battery gauge at 38 %, charging, day theme](../img/widgets/state-of-charge-gauge-light.png#only-light)![A battery gauge at 38 %, charging, night theme](../img/widgets/state-of-charge-gauge-dark.png#only-dark)](../../marimo/electric/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

The charge of the traction battery, 0 to 100 %, with a low zone (`low`, 15 % by default)
where the battery symbol lights amber (EV-001); `charging` shows the charging symbol and
says *CHARGING* (EV-002).

```python
aa.StateOfChargeGauge(38, charging=True)
```

**Electric and hybrid** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
