import test from "node:test";
import assert from "node:assert/strict";

import {
  filterRankedItems,
  paginateRankedItems,
  resolveRankedItems,
  sortRankedItems,
} from "../src/index.js";

test("resolveRankedItems orders hydrated items by score and preserves ties", () => {
  const result = resolveRankedItems(
    [
      { key: "scene-c", score: 0.5 },
      { key: "scene-a", score: 1 },
      { key: "scene-b", score: 0.5 },
      { key: "missing", score: 2 },
    ],
    [
      { id: "scene-a", title: "A" },
      { id: "scene-b", title: "B" },
      { id: "scene-c", title: "C" },
    ],
    (item) => item.id
  );

  assert.deepEqual(result.map(({ item }) => item.id), ["scene-a", "scene-c", "scene-b"]);
  assert.deepEqual(result.map(({ score }) => score), [1, 0.5, 0.5]);
});

test("filterRankedItems retains rank while applying a caller predicate", () => {
  const ranked = [
    { item: { id: "scene-a", watched: false }, score: 1 },
    { item: { id: "scene-b", watched: true }, score: 0.5 },
    { item: { id: "scene-c", watched: false }, score: 0.25 },
  ];

  const result = filterRankedItems(ranked, ({ item }) => !item.watched);

  assert.deepEqual(result.map(({ item }) => item.id), ["scene-a", "scene-c"]);
});

test("sortRankedItems applies a caller comparator while preserving ties", () => {
  const result = sortRankedItems(
    [
      { item: { title: "Bravo" }, score: 1 },
      { item: { title: "Alpha" }, score: 0.5 },
      { item: { title: "Bravo" }, score: 0.25 },
    ],
    (left, right) => left.item.title.localeCompare(right.item.title)
  );

  assert.deepEqual(result.map(({ score }) => score), [0.5, 1, 0.25]);
});

test("paginateRankedItems returns a bounded rank-ordered page and total", () => {
  const result = paginateRankedItems(
    ["a", "b", "c", "d", "e"],
    { page: 2, pageSize: 2 }
  );

  assert.deepEqual(result, {
    end: 4,
    items: ["c", "d"],
    page: 2,
    pageCount: 3,
    pageSize: 2,
    start: 3,
    total: 5,
  });
});

test("paginateRankedItems clamps a stale page to the final page", () => {
  const result = paginateRankedItems(["a", "b", "c"], { page: 9, pageSize: 2 });

  assert.deepEqual(result, {
    end: 3,
    items: ["c"],
    page: 2,
    pageCount: 2,
    pageSize: 2,
    start: 3,
    total: 3,
  });
});
