#!/usr/bin/env python3
"""docs 검사 — 커밋 전에 돌린다 (.claude/rules/docs-writing.md).
결과로 판정한다: 1. 링크(md 안 상대 링크의 파일이 있나) · 2. 도식(```mermaid 블록이 mermaid-cli 로 렌더되나) ·
3. 색인(자기 디렉토리 README 와 docs/README.md 에 올라 있나) · 4. 머리(현행 문서 둘째 줄에 날짜와 '상태:' 가 있나) ·
5. 결정 번호(docs/decisions.md 에 등록된 번호만 쓰나).
usage: python3 tools/docs_check.py [--no-mermaid] [--all]
종료 코드: 0 = 전부 통과, 1 = 실패 있음, 2 = 렌더 검사를 못 함(npx 없음)
"""

import datetime
import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SKIP_LINKS = ("docs/archive/",)
HEADER_DIRS = (
    "docs/runbooks/",
    "docs/lessons/",
)
HEADER_FILES = ("docs/status.md", "docs/README.md", "docs/decisions.md")
REPORT_HEADER_FROM = "2026-10-25"
INDEXED_DIRS = ("docs/reports", "docs/runbooks", "docs/lessons", "docs/archive")

LINK = re.compile(r"\]\(([^)#\s]+)(?:#[^)]*)?\)")
MERMAID = re.compile(r"```mermaid\n(.*?)```", re.S)
MERMAID_CACHE = ".pytest_cache/docs_check/mermaid_ok.json"

DECISION_ID = re.compile(r"\b((?:WF|CS|ARCH)-\d+)\b")
DECISION_SKIP = ("docs/reports/", "docs/archive/", "docs/decisions.md")


def md_files():
    files = glob.glob("docs/**/*.md", recursive=True)
    files += ["CLAUDE.md"] + glob.glob(".claude/rules/*.md")
    return sorted(file for file in files if os.path.isfile(file))


def check_links(files):
    bad = []
    for file in files:
        if file.startswith(SKIP_LINKS):
            continue
        text = MERMAID.sub("", open(file, encoding="utf-8").read())
        for target in LINK.findall(text):
            if target.startswith(("http://", "https://", "mailto:", "file://")):
                continue
            path = os.path.normpath(os.path.join(os.path.dirname(file), target))
            if not os.path.exists(path):
                bad.append(f"{file}: 없는 링크 → {target}")
    return bad


def load_mermaid_cache(use_cache):
    if not use_cache or not os.path.isfile(MERMAID_CACHE):
        return {}
    try:
        with open(MERMAID_CACHE, encoding="utf-8") as handle:
            cache = json.load(handle)
    except ValueError:
        os.remove(MERMAID_CACHE)
        return {}
    return cache if isinstance(cache, dict) else {}


def check_mermaid(files, use_cache=True):
    npx = shutil.which("npx")
    if not npx:
        return None, 0, ["npx 가 없어 렌더 검사를 못 했다"]
    cache = load_mermaid_cache(use_cache)
    bad, rendered, cached = [], 0, 0
    with tempfile.TemporaryDirectory() as tmp:
        for file in files:
            if file.startswith(SKIP_LINKS):
                continue
            for index, block in enumerate(MERMAID.findall(open(file, encoding="utf-8").read())):
                digest = hashlib.sha256(block.encode("utf-8")).hexdigest()
                if digest in cache:
                    cached += 1
                    continue
                rendered += 1
                src = os.path.join(tmp, f"b{rendered}.mmd")
                open(src, "w", encoding="utf-8").write(block)
                proc = subprocess.run(
                    [npx, "-y", "-p", "@mermaid-js/mermaid-cli", "mmdc", "-q", "-i", src, "-o", src + ".svg"],
                    capture_output=True,
                    text=True,
                )
                if proc.returncode != 0:
                    msg = (proc.stderr.strip().splitlines() or ["(메시지 없음)"])[0][:160]
                    bad.append(f"{file}: mermaid 블록 {index + 1} 렌더 실패 — {msg}")
                else:
                    cache[digest] = datetime.date.today().isoformat()
    os.makedirs(os.path.dirname(MERMAID_CACHE), exist_ok=True)
    with open(MERMAID_CACHE, "w", encoding="utf-8") as handle:
        json.dump(cache, handle, indent=0, sort_keys=True)
    return rendered, cached, bad


def check_index(files):
    bad = []
    if not os.path.exists("docs/README.md"):
        return ["docs/README.md 가 없다"]
    top = open("docs/README.md", encoding="utf-8").read()
    for entry in sorted(os.listdir("docs")):
        entry_path = os.path.join("docs", entry)
        if entry == "README.md" or entry.startswith("."):
            continue
        if os.path.isdir(entry_path) or entry.endswith(".md"):
            if f"({entry}" not in top:
                bad.append(f"docs/README.md 에 없음 → {entry}")
    for indexed_dir in INDEXED_DIRS:
        if not os.path.isdir(indexed_dir):
            continue
        readme = os.path.join(indexed_dir, "README.md")
        if not os.path.exists(readme):
            bad.append(f"{readme} 가 없다")
            continue
        idx = open(readme, encoding="utf-8").read()
        for file in sorted(glob.glob(os.path.join(indexed_dir, "*.md"))):
            name = os.path.basename(file)
            if name != "README.md" and f"({name})" not in idx:
                bad.append(f"{readme} 에 없음 → {name}")
    return bad


def check_headers(files):
    bad = []
    for file in files:
        need = file.startswith(HEADER_DIRS) or file in HEADER_FILES
        if file.startswith("docs/reports/") and not file.endswith("README.md"):
            need = os.path.basename(file)[:10] >= REPORT_HEADER_FROM
        if not need:
            continue
        lines = [text for text in open(file, encoding="utf-8").read().splitlines() if text.strip()]
        if len(lines) < 2 or not re.match(r"^\d{4}-\d{2}-\d{2}", lines[1]) or "상태:" not in lines[1]:
            bad.append(f"{file}: 둘째 줄에 '날짜 · 상태:' 가 없다")
    return bad


def check_decision_ids(files):
    if not os.path.exists("docs/decisions.md"):
        return ["docs/decisions.md 가 없다"]
    known = set(re.findall(r"\*\*((?:WF|CS|ARCH)-\d+)\*\*", open("docs/decisions.md", encoding="utf-8").read()))
    bad = []
    for file in files + sorted(glob.glob(".claude/agents/*.md")):
        if file.startswith(DECISION_SKIP):
            continue
        for no, line in enumerate(open(file, encoding="utf-8"), 1):
            for decision_id in DECISION_ID.findall(line):
                if decision_id not in known:
                    bad.append(
                        f"{file}:{no}: 결정 목록에 없는 번호 {decision_id} — 번호 대신 뜻을 쓰거나 결정 목록에 올린다"
                    )
    return bad


def main():
    files = md_files()
    base = check_links(files) + check_index(files) + check_headers(files) + check_decision_ids(files)
    if "--no-mermaid" in sys.argv:
        rendered, cached, mfail = None, 0, ["--no-mermaid 로 건너뜀"]
    else:
        rendered, cached, mfail = check_mermaid(files, use_cache="--all" not in sys.argv)
    failures = base + (mfail if rendered is not None else [])

    print(f"[docs_check] 문서 {len(files)}개")
    print(f"  링크 · 색인 · 머리 · 결정번호: {'통과' if not base else f'실패 {len(base)}건'}")
    print(
        "  mermaid: "
        + (
            "건너뜀 — " + mfail[0]
            if rendered is None
            else f"{rendered + cached}개 블록 · 렌더 {rendered} · 캐시 {cached} · 실패 {len(mfail)}건"
        )
    )
    for line in failures:
        print("  - " + line)
    if failures:
        return 1
    return 2 if rendered is None and "--no-mermaid" not in sys.argv else 0


if __name__ == "__main__":
    sys.exit(main())
