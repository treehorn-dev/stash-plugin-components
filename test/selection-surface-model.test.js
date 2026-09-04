import test from "node:test";
import assert from "node:assert/strict";

import {
  clampSelectedIds,
  clearSelectedIds,
  getDisplayMode,
  getSelectionSummary,
  moveSelectedItems,
  removeSelectedItems,
  selectAllIds,
  toggleSelectedId,
} from "../src/index.js";

function makeItems() {
  return [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
}

test("toggleSelectedId adds and removes ids without mutating input", () => {
  const start = new Set(["a"]);
  const added = toggleSelectedId(start, "b", true);
  const removed = toggleSelectedId(added, "a", false);

  assert.deepEqual(Array.from(start), ["a"]);
  assert.deepEqual(Array.from(added), ["a", "b"]);
  assert.deepEqual(Array.from(removed), ["b"]);
});

test("selectAllIds and clearSelectedIds provide full and empty selections", () => {
  assert.deepEqual(Array.from(selectAllIds(makeItems())), ["a", "b", "c", "d"]);
  assert.deepEqual(Array.from(clearSelectedIds()), []);
});

test("clampSelectedIds removes ids that are no longer present", () => {
  const selected = new Set(["a", "z", "c"]);
  assert.deepEqual(Array.from(clampSelectedIds(selected, makeItems())), ["a", "c"]);
});

test("removeSelectedItems filters out selected entries", () => {
  const items = removeSelectedItems(makeItems(), new Set(["b", "d"]));
  assert.deepEqual(
    items.map((item) => item.id),
    ["a", "c"]
  );
});

test("moveSelectedItems moves a selected block upward by one slot", () => {
  const items = moveSelectedItems(makeItems(), new Set(["c", "d"]), -1);
  assert.deepEqual(
    items.map((item) => item.id),
    ["a", "c", "d", "b"]
  );
});

test("moveSelectedItems moves a selected block downward by one slot", () => {
  const items = moveSelectedItems(makeItems(), new Set(["a", "b"]), 1);
  assert.deepEqual(
    items.map((item) => item.id),
    ["c", "a", "b", "d"]
  );
});

test("getSelectionSummary reports selected and total counts", () => {
  assert.deepEqual(getSelectionSummary(new Set(["a", "c"]), makeItems()), {
    selectedCount: 2,
    totalCount: 4,
    hasSelection: true,
  });
});

test("getDisplayMode normalizes to grid or list", () => {
  assert.equal(getDisplayMode("list"), "list");
  assert.equal(getDisplayMode("wall"), "grid");
});
