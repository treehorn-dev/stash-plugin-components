import test from "node:test";
import assert from "node:assert/strict";

import {
  clearPickerSelection,
  createSearchPickerState,
  rejectSearchPickerResults,
  resolveSearchPickerResults,
  selectPickerRecord,
  setSearchPickerLoading,
  setSearchPickerQuery,
  shouldShowSearchPickerResults,
} from "../src/index.js";

test("search picker defaults to an idle empty state", () => {
  const state = createSearchPickerState();

  assert.deepEqual(state, {
    error: null,
    loading: false,
    minQueryLength: 2,
    query: "",
    results: [],
    selected: null,
  });
  assert.equal(shouldShowSearchPickerResults(state), false);
});

test("search picker keeps results hidden until the query reaches the minimum length", () => {
  const state = setSearchPickerQuery(createSearchPickerState(), "a");

  assert.equal(state.query, "a");
  assert.equal(shouldShowSearchPickerResults(state), false);

  const ready = setSearchPickerQuery(state, "ab");
  assert.equal(shouldShowSearchPickerResults(ready), true);
});

test("search picker tracks loading, results, and selection without auto-clearing the query", () => {
  let state = createSearchPickerState();
  state = setSearchPickerQuery(state, "playlist");
  state = setSearchPickerLoading(state);

  assert.equal(state.loading, true);
  assert.equal(state.error, null);

  state = resolveSearchPickerResults(state, [
    { id: "1", title: "Alpha" },
    { id: "2", title: "Beta" },
  ]);

  assert.equal(state.loading, false);
  assert.equal(state.query, "playlist");
  assert.deepEqual(state.results, [
    { id: "1", title: "Alpha" },
    { id: "2", title: "Beta" },
  ]);

  state = selectPickerRecord(state, { id: "2", title: "Beta" });
  assert.deepEqual(state.selected, { id: "2", title: "Beta" });
  assert.deepEqual(state.results, []);
});

test("search picker can clear selection and preserve failed search state for retry", () => {
  let state = createSearchPickerState({ selected: { id: "2", title: "Beta" } });
  state = clearPickerSelection(state);

  assert.equal(state.selected, null);

  state = setSearchPickerQuery(state, "scene");
  state = setSearchPickerLoading(state);
  state = rejectSearchPickerResults(state, new Error("request failed"));

  assert.equal(state.loading, false);
  assert.equal(state.query, "scene");
  assert.equal(state.error?.message, "request failed");
  assert.equal(shouldShowSearchPickerResults(state), true);
});
