import ast
from pathlib import Path
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate

BACKEND_APP_ROOT = Path(__file__).resolve().parent.parent / "app"
ENDPOINTS_DIR = BACKEND_APP_ROOT / "api" / "v1" / "endpoints"


def find_forbidden_db_calls_in_source(source_code: str) -> list[str]:
    tree = ast.parse(source_code)
    violations: list[str] = []

    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
            owner = node.func.value
            method_name = node.func.attr
            if isinstance(owner, ast.Name) and owner.id == "db":
                if method_name in {"query", "add", "delete", "commit", "execute"}:
                    violations.append(f"line {node.lineno}: db.{method_name}()")

    return violations


def test_endpoints_do_not_call_db_query_or_commit_directly():
    endpoint_files = sorted(ENDPOINTS_DIR.glob("*.py"))
    assert endpoint_files, "Expected endpoint files under app/api/v1/endpoints"

    for file_path in endpoint_files:
        if file_path.name == "__init__.py":
            continue
        source_text = file_path.read_text(encoding="utf-8")
        violations = find_forbidden_db_calls_in_source(source_text)
        assert not violations, f"R3/C1 violation in {file_path.name}: {violations}"


def test_todo_model_s2_docstring_and_s7_soft_delete_columns():
    assert Todo.__doc__ and "S2:" in Todo.__doc__, "S2: Todo docstring must declare duplicate-allowed intent"

    column_names = set(Todo.__table__.columns.keys())
    required_soft_delete = {"deleted_at", "deleted_by", "delete_reason"}
    missing_soft_delete = required_soft_delete - column_names
    assert not missing_soft_delete, f"S7: Missing soft-delete columns on Todo: {missing_soft_delete}"

    required_calendar_cols = {"started_on", "due_date", "category"}
    missing_calendar_cols = required_calendar_cols - column_names
    assert not missing_calendar_cols, f"ARCH-5: Missing calendar columns on Todo: {missing_calendar_cols}"

    response_fields = set(TodoResponse.model_fields.keys())
    assert {"id", "user_id", "title", "started_on", "due_date", "category", "status"} <= response_fields


def test_todo_input_schemas_enforce_max_length():
    for schema_cls in (TodoCreate, TodoUpdate):
        for field_name in ("title", "description"):
            field_info = schema_cls.model_fields[field_name]
            metadata_repr = repr(field_info.metadata)
            assert "MaxLen" in metadata_repr, (
                f"CS-3 violation: {schema_cls.__name__}.{field_name} must specify max_length"
            )


def test_red_check_detector_catches_simulated_router_violation():
    broken_router_code = """
def bad_endpoint(db):
    return db.query(Todo).all()
"""
    detected = find_forbidden_db_calls_in_source(broken_router_code)
    assert detected == ["line 3: db.query()"]
