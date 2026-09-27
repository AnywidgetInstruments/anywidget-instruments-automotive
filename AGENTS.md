# AGENTS.md

Guidance for AI coding agents (and humans) working on this repository.

## Project

`anywidget-automotives`: automotive instruments (speedometer, tachometer, gauges,
tell-tales, trip computer, cluster, head-up display mode) for computational notebooks,
built on [anywidget](https://anywidget.dev) and on
[anywidget-instruments](https://github.com/s-celles/anywidget-instruments), whose base
class, trait contract, themes and hosts it reuses.

The repository is at the **design stage**: `docs/` holds the documentation and the EARS
specification, and no widget is implemented yet.

## Rules

- Requirements come from `docs/specification.md`; `docs/requirements-status.md` tracks
  them. A change of behaviour goes through the specification first (bump its version).
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
mkdocs serve        # documentation site, from docs/
```

## Conventions

- Comments explain *why*, not *what*.
- Tests are named as sentences describing the behaviour.
- Commit messages state the problem, then the change, and end with `Assisted-by: AI`.
