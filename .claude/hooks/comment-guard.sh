#!/bin/bash
# 주석 규칙 — .py 에 쓰기 전(PreToolUse), 쓸 글에 구분선 주석 · 날짜 · 4줄 이상 주석 덩어리가 있으면 막는다(종료 코드 2 · stderr).
set -u
repo="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
exec python3 "$repo/tools/comment_guard.py"
