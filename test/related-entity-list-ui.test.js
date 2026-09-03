import test from "node:test";
import assert from "node:assert/strict";

import {
  createEntityPresentation,
  renderCollectionSurface,
  renderRelatedEntityList,
  renderSearchPickerSurface,
} from "../src/index.js";

function createFakeReact() {
  return {
    Fragment: Symbol.for("fragment"),
    createElement(type, props, ...children) {
      return {
        type,
        props: props ?? {},
        children,
      };
    },
  };
}

function FakeButton() {}

test("renderRelatedEntityList renders an empty state", () => {
  const React = createFakeReact();
  const empty = renderRelatedEntityList({ React, Button: FakeButton }, {
    emptyMessage: "No related scenes.",
    items: [],
    renderMeta: () => null,
    renderTitle: (item) => item.title,
  });

  assert.equal(empty.type, "div");
  assert.equal(empty.props.className, "stash-composables-related-entity-list__empty");
  assert.deepEqual(empty.children, ["No related scenes."]);
});

test("renderRelatedEntityList renders rows and optional remove actions", () => {
  const React = createFakeReact();
  const list = renderRelatedEntityList({ React, Button: FakeButton }, {
    getItemKey: (item) => item.id,
    items: [{ id: "2", title: "Child Scene", details: "Excerpt" }],
    onRemove: () => {},
    removeLabel: "Remove",
    renderMeta: (item) => item.details,
    renderTitle: (item) => item.title,
  });

  assert.equal(list.type, "div");
  assert.equal(list.props.className, "stash-composables-related-entity-list");
  assert.equal(list.children.length, 1);

  const row = list.children[0];
  assert.equal(row.props.className, "stash-composables-related-entity-list__row");
});

test("renderSearchPickerSurface renders selected rows, query input, and result actions", () => {
  const React = createFakeReact();
  const Icon = function FakeIcon() {};

  const surface = renderSearchPickerSurface(
    { React, Form: { Control: "input" }, Button: FakeButton, Icon },
    {
      emptyResultsMessage: "No scenes found.",
      inputPlaceholder: "Search scenes",
      onClearSelection: () => {},
      onQueryChange: () => {},
      onSelectResult: () => {},
      query: "candy",
      renderResultMeta: (item) => item.meta,
      renderResultTitle: (item) => item.title,
      renderSelectedMeta: (item) => item.meta,
      renderSelectedTitle: (item) => item.title,
      results: [{ id: "2", meta: "2026-08-10", title: "Scene 2" }],
      selectedItems: [{ id: "1", meta: "Parent scene", title: "Scene 1" }],
      selectButtonLabel: "Select",
      selectedActionLabel: "Change",
      selectedRemoveLabel: "Clear",
      showResults: true,
    }
  );

  assert.equal(surface.type, "div");
  assert.equal(surface.props.className, "stash-composables-search-picker");
  assert.equal(surface.children.length, 3);

  const selected = surface.children[0];
  assert.equal(selected.props.className, "stash-composables-related-entity-list");

  const inputRow = surface.children[1];
  assert.equal(inputRow.props.className, "stash-composables-search-picker__input");

  const results = surface.children[2];
  assert.equal(results.props.className, "stash-composables-search-picker__results");
});

test("renderSearchPickerSurface can render thumbnails and inline actions inside each grouped picker", () => {
  const React = createFakeReact();
  const Icon = function FakeIcon() {};

  const surface = renderSearchPickerSurface(
    { React, Form: { Control: "input" }, Button: FakeButton, Icon },
    {
      action: { disabled: false, label: "Add Parent", onClick: () => {}, variant: "secondary" },
      emptyResultsMessage: "No scenes found.",
      inputPlaceholder: "Search parent scenes",
      onClearSelection: () => {},
      onQueryChange: () => {},
      onSelectResult: () => {},
      query: "scene",
      renderResultMeta: (item) => item.meta,
      renderResultThumb: (item) => item.thumb,
      renderResultTitle: (item) => item.title,
      renderSelectedMeta: (item) => item.meta,
      renderSelectedThumb: (item) => item.thumb,
      renderSelectedTitle: (item) => item.title,
      results: [{ id: "2", meta: "2026-08-10", thumb: "/scene/2/screenshot", title: "Scene 2" }],
      selectedItems: [{ id: "1", meta: "Parent scene", thumb: "/scene/1/screenshot", title: "Scene 1" }],
      selectedActionLabel: "Change",
      selectedRemoveLabel: "Clear",
      showResults: true,
    }
  );

  const inputRow = surface.children[1];
  assert.equal(inputRow.props.className, "stash-composables-search-picker__input");
  assert.equal(inputRow.children.length, 3);

  const selected = surface.children[0];
  const selectedRow = selected.children[0];
  assert.equal(selectedRow.children[0].props.className, "stash-composables-search-picker__thumb");

  const results = surface.children[2];
  const resultButton = results.children[0][0];
  assert.equal(resultButton.children[0].props.className, "stash-composables-search-picker__thumb");
  assert.equal(resultButton.children[1].props.className, "stash-composables-search-picker__result-main");
});

test("renderCollectionSurface renders header, loading, empty, and populated states", () => {
  const React = createFakeReact();

  const loading = renderCollectionSurface(
    { React, Spinner: "spinner" },
    {
      description: "Plugin-owned collections.",
      items: [],
      loading: true,
      renderItem: (item) => item,
      title: "Playlists",
    }
  );
  assert.equal(loading.children[1].type, "spinner");

  const empty = renderCollectionSurface(
    { React, Spinner: "spinner" },
    {
      description: "Plugin-owned collections.",
      emptyMessage: "Nothing here yet.",
      items: [],
      loading: false,
      renderItem: (item) => item,
      title: "Playlists",
    }
  );
  assert.equal(empty.children[1].props.className, "stash-composables-collection__empty");

  const populated = renderCollectionSurface(
    { React, Spinner: "spinner" },
    {
      description: "Plugin-owned collections.",
      items: [{ id: "1", title: "Alpha" }],
      loading: false,
      renderItem: (item) =>
        React.createElement("article", { className: "card", key: item.id }, item.title),
      title: "Playlists",
    }
  );
  assert.equal(populated.children[1].props.className, "stash-composables-collection__items");
});

test("renderCollectionSurface can delegate rendering through a presentation and display mode", () => {
  const React = createFakeReact();
  const collection = renderCollectionSurface(
    { React, Spinner: "spinner" },
    {
      items: [{ id: "1", title: "Alpha", details: "Sampler" }],
      loading: false,
      presentation: createEntityPresentation({
        adapter: {
          entityType: "playlist",
          keyOf: (item) => item.id,
          titleOf: (item) => item.title,
          metaOf: (item) => [item.details],
        },
      }),
      displayMode: "list",
      title: "Playlists",
    }
  );

  const items = collection.children[1];
  assert.equal(items.props.className, "stash-composables-collection__items");
  assert.equal(items.children[0].type, "article");
  assert.equal(
    items.children[0].props.className,
    "stash-composables-mode-card stash-composables-mode-card--list"
  );
});

test("renderCollectionSurface allows callers to choose the collection heading element", () => {
  const React = createFakeReact();
  const element = renderCollectionSurface(
    { React, Spinner: "spinner" },
    { title: "Related scenes", headingElement: "h3", items: ["scene"] }
  );

  assert.equal(element.children[0].children[0].children[0].type, "h3");
});
