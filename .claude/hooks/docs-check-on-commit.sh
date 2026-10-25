#!/bin/bash
# git commit 직전에 문서 검사(tools/docs_check.py)를 돌린다. Claude 의 PreToolUse 훅에서 부른다.
# 종료 코드 2 = 커밋을 막는다(훅 규약).
cmd=$(jq -r '.tool_input.command // ""' 2>/dev/null)
echo "$cmd" | grep -Eq '(^|[;&|(]|[[:space:]])git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+commit([[:space:]]|$)' || exit 0
echo "$cmd" | grep -Eq 'commit[^;&|]*--dry-run' && exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

out=$(python3 tools/docs_check.py 2>&1)
rc=$?
case $rc in
  0) exit 0 ;;
  2) echo "docs_check: 도식 렌더 검사를 못 했다(npx 없음). 링크·색인·머리는 통과했다." >&2
     exit 0 ;;
  *) echo "docs_check 실패 — 커밋을 막았다. 고친 뒤 다시 커밋한다." >&2
     echo "$out" | tail -40 >&2
     exit 2 ;;
esac
