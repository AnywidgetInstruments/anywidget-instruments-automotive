"""QA-001: every requirement marked M is covered by at least one automated test.

A test covers a requirement by citing its identifier, alone or in a range
(``TEL-001 .. TEL-008``). The requirements not yet implemented are listed with
the reason; the list may only shrink.
"""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).parent.parent
SPEC = (ROOT / "docs" / "specification.md").read_text("utf-8")
MUST = re.findall(r"^\| ([A-Z0-9]+-\d{3}) \| M \|", SPEC, re.M)
TESTS = "".join(
    p.read_text("utf-8")
    for pattern in ("js/test/*.ts", "tests/*.py", "e2e/*.js")
    for p in sorted(ROOT.glob(pattern))
    if p.name != "test_traceability.py"
)

#: Not implemented yet, and why (docs/requirements-status.md).
NOT_YET = {
    "LEG-001": "the visual angle waits for ISO 15008 (open question 3)",
    "QA-001": "this test: complete when NOT_YET is empty",
}


def _cited(req: str) -> bool:
    group, number = req.split("-")
    if re.search(rf"\b{req}\b", TESTS):
        return True
    for lo, hi in re.findall(rf"{group}-(\d{{3}}) \.\. {group}-(\d{{3}})", TESTS):
        if int(lo) <= int(number) <= int(hi):
            return True
    return False


def test_every_must_requirement_is_cited_by_a_test() -> None:
    missing = [r for r in MUST if r not in NOT_YET and not _cited(r)]
    assert not missing, f"no test cites {missing}"


def test_the_list_of_requirements_not_yet_covered_only_shrinks() -> None:
    assert set(NOT_YET) <= set(MUST)
    stale = [r for r in NOT_YET if r != "QA-001" and _cited(r)]
    assert not stale, f"{stale} are cited by a test now: take them off NOT_YET"
