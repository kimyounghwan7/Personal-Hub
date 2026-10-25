#!/usr/bin/env python3
"""감싸기 훅(WF-7) — .py 를 고칠 때마다 단순 감싸기(shape-one-call)가 git HEAD 보다 늘었으면 되돌려 보낸다."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "tools"))
import code_shape  # noqa: E402

GUARDED = ("shape-one-call",)
SKIP = (".venv/", "venv/", "node_modules/", "drafts/", "docs/archive/", "backend/alembic/versions/")


def head_bytes(rel: str) -> bytes | None:
    shown = subprocess.run(["git", "-C", str(REPO), "show", f"HEAD:{rel}"], capture_output=True, check=False)
    return shown.stdout if shown.returncode == 0 else None


def wrappers(path: Path, repo: Path) -> list[dict]:
    return [found for found in code_shape.shape_findings([path], repo) if found["rule"] in GUARDED]


def head_count(rel: str) -> int:
    before = head_bytes(rel)
    if before is None:
        return 0
    with tempfile.TemporaryDirectory() as tmp:
        old = Path(tmp) / rel
        old.parent.mkdir(parents=True, exist_ok=True)
        old.write_bytes(before)
        return len(wrappers(old, Path(tmp)))


def check(path: Path) -> list[str]:
    full = path.resolve()
    if path.suffix != ".py" or not full.is_file() or not full.is_relative_to(REPO):
        return []
    rel = str(full.relative_to(REPO))
    if rel.startswith(SKIP):
        return []
    now = wrappers(full, REPO)
    if not now:
        return []
    before = head_count(rel)
    if len(now) <= before:
        return []
    listed = " · ".join(f"{found['text']}({found['line']}줄)" for found in now)
    return [
        f"{rel}: 단순 감싸기가 늘었다 — HEAD {before} → 지금 {len(now)} (WF-7). "
        f"호출 하나뿐인 함수는 부르는 자리에 두거나 인자로 넘긴다: {listed}"
    ]


def hook_paths() -> list[Path]:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        return []
    file_path = (data.get("tool_input") or {}).get("file_path") or (data.get("tool_response") or {}).get("filePath")
    return [Path(file_path)] if file_path else []


def main() -> int:
    paths = [Path(arg) for arg in sys.argv[1:]] or hook_paths()
    try:
        problems = [problem for path in paths for problem in check(path)]
    except (SyntaxError, OSError) as err:
        print(f"감싸기 검사 실패: {err}", file=sys.stderr)
        return 2
    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
