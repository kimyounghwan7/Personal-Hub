#!/bin/bash
# 파괴적 명령(rm -r · rm -rf · mv · cp(덮어쓰기) · git mv · git rm · git checkout --)을 다른 명령과 한 블록에 묶으면 막는다(WF-4).
# 승인이 거부돼도 블록 앞부분이 먼저 실행돼 산출물을 잃은 적이 있다 — 파괴적 명령은 단독으로 실행한다.
# Claude 의 PreToolUse(Bash) 훅에서 부른다. 종료 코드 2 = 막는다(훅 규약).
cmd=$(jq -r '.tool_input.command // ""' 2>/dev/null)
[ -n "$cmd" ] || exit 0
cmd=$(printf '%s' "$cmd" | perl -0pe 's/"(?:[^"\\]|\\.)*"//gs; s/\x27[^\x27]*\x27//gs')
destructive='(^|[;&|(]|[[:space:]])(rm[[:space:]]+(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)|mv([[:space:]]|$)|cp([[:space:]]|$)|git[[:space:]]+(mv|rm)[[:space:]]|git[[:space:]]+checkout[[:space:]]+--[[:space:]])'
echo "$cmd" | grep -Eq "$destructive" || exit 0
lines=$(printf '%s' "$cmd" | grep -c '')
if [ "$lines" -gt 1 ] || echo "$cmd" | grep -Eq '&&|\|\||;|[^|]\|[^|]'; then
  echo "파괴적 명령(rm -r · mv · cp · git mv · git rm · git checkout --)을 다른 명령과 묶었다 — 단독으로 실행한다(WF-4)." >&2
  echo "명령: $(printf '%s' "$cmd" | head -3)" >&2
  exit 2
fi
exit 0
