# AGENTS.md

Guidance for AI coding agents (and humans) working on this repository.

## Project

`anywidget-automotives`: automotive instruments (speedometer, tachometer, gauges,
tell-tales, trip computer, cluster, head-up display mode) for computational notebooks,
built on [anywidget](https://anywidget.dev) and on
[anywidget-instruments](https://github.com/s-celles/anywidget-instruments), whose base
class, trait contract, themes and hosts it reuses.

The library is a **TypeScript front end first**: the anywidget front-end modules are the
implementation, and Python, Julia (KaimonSlate.jl), Rust and other languages are hosts
that set traits described by the trait contract.

The repository is in **early implementation**: every widget of the catalog is written
(tell-tales, dials, digital displays, the `Cluster` and its head-up display mode), with
the Python binding; the next milestones are in `docs/roadmap.md`, and where each
requirement stands in `docs/requirements-status.md`. `docs/development.md` describes
the layout.

## Rules

- Requirements come from `docs/specification.md`; `docs/requirements-status.md` tracks
  them. A change of behaviour goes through the specification first (bump its version).
- Anything a widget displays — unit conversion, rounding, zones, stale states — is
  computed in the TypeScript front end, never in a host binding, so every host shows
  the same figures. A host binding only sets traits; it may accept its language's unit
  quantities (pint, DynamicQuantities.jl, uom) and pass them on as a number and a unit name.
- Build on anywidget-instruments rather than re-implementing it: a widget here derives
  from its base class and honours its trait contract. Anything general enough to serve
  a non-automotive display belongs upstream.
- Every widget is an indicator. Nothing is meant to be operated while driving.
- Conventions come from the documents in `docs/standards.md`. The library claims no
  conformity with them; do not write "compliant with" in code, docs or commits.
- Keep the safety notice (`docs/safety.md`) true: if a change affects what the widgets
  can be trusted with, update it in the same change.
- Quote figures from standards only after checking them against the official text.

## Commands

```bash
npm install && npm run build    # trait contract + front-end bundle
npm run lint && npm run typecheck && npm test
npm run images                  # docs/img/<widget>-light.png and -dark.png, from the widgets
pip install "anywidget-instruments @ git+https://github.com/s-celles/anywidget-instruments@<commit of package.json>"
pip install -e ".[dev]" && pytest && ruff check . && ruff format --check . && mypy src
mkdocs serve                    # documentation site, from docs/
python scripts/screenshots.py   # light and dark images of the cluster preview
```

The images of `docs/img/` are captures of the running code: take them again whenever
a widget or the preview changes, so the site never shows an older look.

## Conventions

- Comments explain *why*, not *what*.
- Tests are named as sentences describing the behaviour.
- Never commit generated files: `js/src/generated/`, `src/anywidget_automotives/static/`.
- Commit messages state the problem, then the change, and end with `Assisted-by: AI`.
