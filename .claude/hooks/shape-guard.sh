#!/bin/bash
# 감싸기 규칙(WF-7) — .py 를 고친 뒤 단순 감싸기(shape-one-call)가 git HEAD 보다 늘었으면 되돌려 보낸다(종료 코드 2 · stderr).
set -u
repo="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
exec python3 "$repo/tools/shape_guard.py"
