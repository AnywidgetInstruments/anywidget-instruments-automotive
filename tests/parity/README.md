# Parity cases

Traits in, figures out (HOST-003). The front end runs every case
(`js/test/parity.test.ts`); every host binding shipped with the library runs
them too (`tests/test_parity.py` for Python), so that a binding cannot drift
from the front end: it accepts the same unit names and passes the same traits
through unchanged, and the figures are the front end's.

Non-finite numbers are written as the strings `"nan"`, `"inf"`, `"-inf"`; an
expected `null` means that no figure is shown.
