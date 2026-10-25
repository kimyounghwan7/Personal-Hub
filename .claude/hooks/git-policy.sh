#!/bin/bash
# git · gh 명령에 팀 정책을 건다(결정 WF-3). Claude 의 PreToolUse(Bash) 훅에서 부른다.
#   - 지키는 브랜치(PROTECTED_BRANCH)나 작업 브랜치(ASK_PUSH_BRANCHES)로 push → 묻는다
#   - main 으로 가는 PR 만들기(gh pr create) → 묻는다
#   - main 으로 가는 PR merge(gh pr merge)  → 막는다 — 사용자가 한다
cmd=$(jq -r '.tool_input.command // ""' 2>/dev/null)
root="${CLAUDE_PROJECT_DIR:-.}"
[ -f "$root/.claude/git-policy.conf" ] && . "$root/.claude/git-policy.conf"
PROTECTED_BRANCH="${PROTECTED_BRANCH:-main}"

deny() { echo "git 정책: $1" >&2; exit 2; }
ask() {
  jq -n --arg r "git 정책: $1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'
  exit 0
}
segments=$(printf '%s\n' "$cmd" | sed -E 's/(&&|\|\||;|\|)/\n/g')
cur=$(git -C "$root" rev-parse --abbrev-ref HEAD 2>/dev/null)
P="$PROTECTED_BRANCH"

while IFS= read -r seg; do
  seg=$(printf '%s' "$seg" | sed -E 's/^[[:space:]]+//')
  if printf '%s' "$seg" | grep -Eq '^git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+push([[:space:]]|$)'; then
    args=$(printf '%s' "$seg" | sed -E 's/^.*[[:space:]]push//')
    refs=$(printf '%s' "$args" | tr ' ' '\n' | grep -v '^-' | grep -vx 'origin' | grep -v '^$')
    [ -z "$refs" ] && refs="$cur"
    for b in $ASK_PUSH_BRANCHES; do
      printf '%s\n' "$refs" | grep -Eq "(^|:)$b$" && ask "$b 브랜치로 push 하기 전에 사용자에게 묻는다."
    done
    if printf ' %s ' "$args" | grep -Eq "([[:space:]:])$P([[:space:]]|$)" || [ "$refs" = "$P" ]; then
      ask "$P 브랜치로 push 하기 전에 사용자에게 묻는다."
    fi
  fi
  if printf '%s' "$seg" | grep -Eq '^gh[[:space:]]+pr[[:space:]]+create([[:space:]]|$)'; then
    base=$(printf '%s' "$seg" | sed -nE 's/.*(--base|-B)[[:space:]=]+([^[:space:]]+).*/\2/p')
    base="${base//\"/}"; base="${base//\'/}"
    if [ -z "$base" ] || [ "$base" = "$P" ]; then
      ask "$P 으로 가는 PR 이다. 만들기 전에 사용자 허락을 받는다."
    fi
  fi
  if printf '%s' "$seg" | grep -Eq '^gh[[:space:]]+pr[[:space:]]+merge([[:space:]]|$)'; then
    target=$(printf '%s' "$seg" | sed -E 's/^gh[[:space:]]+pr[[:space:]]+merge//' | tr ' ' '\n' | grep -v '^-' | grep -v '^$' | head -1)
    pbase=$(cd "$root" && gh pr view $target --json baseRefName -q .baseRefName 2>/dev/null)
    [ -z "$pbase" ] && ask "merge 할 PR 의 대상 브랜치를 확인하지 못했다."
    [ "$pbase" = "$P" ] && deny "$P 으로 가는 PR 은 사용자가 merge 한다."
  fi
done <<< "$segments"
exit 0
