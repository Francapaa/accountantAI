# fakes.py — In-memory Supabase stand-in for WhatsApp tests (no network/DB).
"""In-memory fake for the supabase-py client (no network/DB)."""

from __future__ import annotations

from typing import Any


class FakeResult:
    def __init__(self, data: list[dict[str, Any]] | None) -> None:
        self.data = data or []


class _Builder:
    def __init__(self, fake: "FakeSupabase", name: str) -> None:
        self._fake = fake
        self._name = name
        self._filters: list[tuple[str, str, Any]] = []
        self._cols: list[str] | None = None
        self._limit: int | None = None
        self._order: str | None = None
        self._do_delete = False
        self._insert_row: dict[str, Any] | None = None

    def select(self, *cols: str) -> "_Builder":
        joined = [c for col in cols for c in col.split(",")]
        self._cols = [c.strip() for c in joined if c.strip()]
        return self

    def eq(self, col: str, value: Any) -> "_Builder":
        self._filters.append(("eq", col, value))
        return self

    def limit(self, n: int) -> "_Builder":
        self._limit = n
        return self

    def order(self, col: str) -> "_Builder":
        self._order = col
        return self

    def insert(self, row: dict[str, Any]) -> "_Builder":
        self._insert_row = row
        return self

    def delete(self) -> "_Builder":
        self._do_delete = True
        return self

    def execute(self) -> FakeResult:
        if self._insert_row is not None:
            return self._fake._insert(self._name, self._insert_row)
        if self._do_delete:
            return self._fake._delete(self._name, self._filters)
        return self._fake._select(
            self._name, self._cols, self._filters, self._limit, self._order
        )


class FakeSupabase:
    def __init__(self) -> None:
        self.tables: dict[str, list[dict[str, Any]]] = {
            "clients": [],
            "conversations": [],
            "messages": [],
            "whatsapp_connections": [],
        }
        self._seq = 0

    def table(self, name: str) -> _Builder:
        return _Builder(self, name)

    def _matches(self, row: dict[str, Any], filters) -> bool:
        for kind, col, value in filters:
            if kind == "eq" and row.get(col) != value:
                return False
        return True

    def _select(self, name: str, cols: list[str] | None, filters=None,
                limit=None, order=None) -> FakeResult:
        rows = [r for r in self.tables[name] if self._matches(r, filters or [])]

        def project(row: dict[str, Any]) -> dict[str, Any]:
            if not cols or cols == ["*"]:
                return dict(row)
            return {c: row.get(c) for c in cols}

        rows = [project(r) for r in rows]
        if order:
            rows.sort(key=lambda r: (r.get(order) is None, r.get(order)))
        if limit is not None:
            rows = rows[: limit]
        return FakeResult(rows)

    def _delete(self, name: str, filters) -> FakeResult:
        kept = []
        deleted: list[dict[str, Any]] = []
        for r in self.tables[name]:
            if self._matches(r, filters):
                deleted.append(r)
            else:
                kept.append(r)
        self.tables[name] = kept
        return FakeResult(deleted)

    def _insert(self, name: str, row: dict[str, Any]) -> FakeResult:
        new_row = dict(row)
        if "id" not in new_row:
            self._seq += 1
            new_row["id"] = f"{name}-{self._seq}"
        self.tables[name].append(new_row)
        return FakeResult([new_row])