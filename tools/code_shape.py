#!/usr/bin/env python3
"""백엔드 Python 코드 모양 계측 및 검사 — 분기 · 삼항식 · try · 들여쓰기 · 단순 감싸기 · 주석 규칙을 센다(ast, 표준 라이브러리만).

usage:
  python3 tools/code_shape.py [경로]
"""

from __future__ import annotations

import ast
import collections
import io
import json
import re
import sys
import tokenize
from pathlib import Path

BLOCKS = (ast.If, ast.For, ast.While, ast.Try, ast.With) + ((ast.Match,) if hasattr(ast, "Match") else ())
BANNER = re.compile(r"-{4,}|={4,}|─{2,}|━{2,}|\*{4,}|#{4,}|~{4,}|_{4,}")
DATE = re.compile(r"20\d\d-\d\d-\d\d(?!_)")
COMMENT_BLOCK_MAX = 3
DOCSTRING_MAX = {"module": 8, "def": 5}
LOCAL_FUNCTION_MIN_USES = 2


def comment_findings(source: str) -> list[tuple[int, str, str]]:
    """주석 규칙 — (줄, 규칙, 내용). 품질 검사(shape)와 편집 훅(tools/comment_guard.py)이 함께 쓴다."""
    lines = source.split("\n")
    found: list[tuple[int, str, str]] = []
    run: list[int] = []
    for token in tokenize.generate_tokens(io.StringIO(source).readline):
        if token.type != tokenize.COMMENT:
            continue
        line = token.start[0]
        if BANNER.search(token.string):
            found.append((line, "shape-banner-comment", token.string[:60]))
        if DATE.search(token.string):
            found.append((line, "shape-comment-date", token.string[:60]))
        if not lines[line - 1].lstrip().startswith("#"):
            continue
        between = lines[run[-1] : line - 1] if run else []
        if run and any(text.strip() for text in between):
            if len(run) > COMMENT_BLOCK_MAX:
                found.append((run[0], "shape-comment-block", f"{len(run)}줄"))
            run = []
        run.append(line)
    if len(run) > COMMENT_BLOCK_MAX:
        found.append((run[0], "shape-comment-block", f"{len(run)}줄"))
    return found


def depth(node: ast.AST, level: int = 0) -> int:
    return max([level] + [depth(child, level + isinstance(child, BLOCKS)) for child in ast.iter_child_nodes(node)])


def outer_ifexps(tree: ast.AST) -> list[ast.IfExp]:
    found: list[ast.IfExp] = []

    def visit(node: ast.AST, inside: bool) -> None:
        if isinstance(node, ast.IfExp) and not inside:
            found.append(node)
        for child in ast.iter_child_nodes(node):
            visit(child, inside or isinstance(node, ast.IfExp))

    visit(tree, False)
    return found


def call_names(trees: dict[str, ast.AST]) -> collections.Counter:
    names: collections.Counter = collections.Counter()
    for tree in trees.values():
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                func = node.func
                name = func.attr if isinstance(func, ast.Attribute) else func.id if isinstance(func, ast.Name) else None
                if name:
                    names[name] += 1
    return names


def is_override_or_property(node: ast.FunctionDef | ast.AsyncFunctionDef) -> bool:
    for decorator in node.decorator_list:
        base = ast.unparse(decorator).split("(")[0].strip()
        if base not in {"staticmethod", "classmethod"}:
            return True
    return False


def is_wrapper(node: ast.FunctionDef | ast.AsyncFunctionDef) -> bool:
    """호출 하나를 감싸기만 하는 함수 판별."""
    body = [
        stmt
        for stmt in node.body
        if not (isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant))
        and not isinstance(stmt, (ast.Import, ast.ImportFrom))
    ]
    if len(body) == 2 and isinstance(body[0], ast.Assign) and isinstance(body[1], ast.Return):
        target, returned = body[0].targets, body[1].value
        single = len(target) == 1 and isinstance(target[0], ast.Name)
        if single and isinstance(returned, ast.Name) and returned.id == target[0].id:
            body = [ast.Return(value=body[0].value)]
    if len(body) != 1 or not isinstance(body[0], (ast.Return, ast.Expr)):
        return False
    call = getattr(body[0], "value", None)
    if not isinstance(call, ast.Call) or any(isinstance(child, ast.Call) for child in ast.walk(call.func)):
        return False
    calc_nodes = (
        ast.Call,
        ast.BinOp,
        ast.UnaryOp,
        ast.BoolOp,
        ast.Compare,
        ast.IfExp,
        ast.ListComp,
        ast.SetComp,
        ast.DictComp,
        ast.GeneratorExp,
        ast.Lambda,
    )
    arg_values = [*call.args, *(kw.value for kw in call.keywords)]
    return not any(isinstance(child, calc_nodes) for arg_node in arg_values for child in ast.walk(arg_node))


def is_boundary_delegation(rel: str, node: ast.FunctionDef | ast.AsyncFunctionDef) -> bool:
    """FastAPI 엔드포인트 라우터나 DI 의존성, 서비스 진입점 위임은 허용."""
    if "api/v1/endpoints/" in rel:
        return True
    if "core/security.py" in rel:
        return True
    return False


def shape_findings(paths: list[Path], repo: Path) -> list[dict]:
    trees = {str(path.relative_to(repo)): ast.parse(path.read_text(encoding="utf-8")) for path in paths}
    names = call_names(trees)
    found: list[dict] = []

    for rel, tree in trees.items():

        def add(line: int, rule: str, text: str, rel: str = rel) -> None:
            found.append({"file": rel, "line": line, "rule": rule, "text": text})

        for line, rule, text in comment_findings((repo / rel).read_text(encoding="utf-8")):
            add(line, rule, text)
        for node in outer_ifexps(tree):
            if any(isinstance(inner, ast.IfExp) for inner in ast.walk(node) if inner is not node):
                add(node.lineno, "shape-nested-ifexp", ast.unparse(node)[:100])
        for node in ast.walk(tree):
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            nest = depth(node)
            if nest >= 4:
                add(node.lineno, "shape-deep-nesting", f"{node.name} {nest}단")
            if (
                is_wrapper(node)
                and not is_override_or_property(node)
                and not node.name.startswith("__")
                and names.get(node.name, 0) <= 1
                and not is_boundary_delegation(rel, node)
            ):
                add(node.lineno, "shape-one-call", node.name)
    return found


def main() -> int:
    repo = Path(__file__).resolve().parents[1]
    target = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else (repo / "backend" / "app")
    paths = [
        path
        for path in sorted(target.rglob("*.py"))
        if "__pycache__" not in path.parts and ".venv" not in path.parts and "alembic/versions" not in str(path)
    ]
    findings = shape_findings(paths, repo)
    print(json.dumps({"checked_files": len(paths), "findings": findings}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
