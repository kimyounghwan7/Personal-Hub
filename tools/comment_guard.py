#!/usr/bin/env python3
"""주석 규칙 훅 — 방금 쓴 글에 구분선 주석 · 날짜 · 긴 주석 덩어리가 있는지 본다."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from code_shape import comment_findings  # noqa: E402

SKIP = (".venv/", "venv/", "node_modules/", "drafts/", "docs/archive/", "alembic/versions/")


def written(tool_input: dict) -> list[str]:
    edits = tool_input.get("edits") or [tool_input]
    texts = [edit.get("new_string") for edit in edits] + [tool_input.get("content")]
    return [text for text in texts if text]


def problems(tool_input: dict) -> list[str]:
    path = str(tool_input.get("file_path") or "")
    if not path.endswith(".py") or any(part in path for part in SKIP):
        return []
    found = []
    for text in written(tool_input):
        lines = [
            line.lstrip() if line.lstrip().startswith("#") or not line.strip() else "pass" for line in text.split("\n")
        ]
        found += [
            f"{path}: 쓴 글 {line}줄 {rule} — {snippet}" for line, rule, snippet in comment_findings("\n".join(lines))
        ]
    return found


def main() -> int:
    found = problems(json.loads(sys.stdin.read() or "{}").get("tool_input") or {})
    if found:
        print(
            "주석 규칙(구분선 · 날짜 · 4줄 이상 덩어리는 코드에 쓰지 않는다 — 근거는 문서에, 코드에는 결정 번호만):",
            file=sys.stderr,
        )
        print("\n".join(found), file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
