import test from "node:test";
import assert from "node:assert/strict";

import {
  renderSelectableGrid,
  renderSelectableTable,
  renderSelectionToolbar,
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
function FakeButtonGroup() {}

test("renderSelectionToolbar renders selection and display controls", () => {
  const React = createFakeReact();

  const element = renderSelectionToolbar(
    { React, Button: FakeButton, ButtonGroup: FakeButtonGroup },
    {
      hasSelection: true,
      displayMode: "grid",
      onMoveDown: () => {},
      onMoveUp: () => {},
      onRemoveSelected: () => {},
      onSelectAll: () => {},
      onSelectNone: () => {},
      onSetDisplayMode: () => {},
    }
  );

  assert.equal(element.type, "div");
  assert.equal(
    element.props.className,
    "stash-composables-selection-toolbar"
  );
  assert.equal(element.children.length, 3);
});

test("renderSelectableGrid renders item wrappers and empty state", () => {
  const React = createFakeReact();
  const items = [{ id: "a", title: "Alpha" }];

  const grid = renderSelectableGrid({ React }, {
    emptyMessage: "Nothing here",
    getItemId: (item) => item.id,
    items,
    onSelectChange: () => {},
    renderItemBody: (item) => React.createElement("span", null, item.title),
    selectedIds: new Set(["a"]),
  });

  assert.equal(grid.type, "div");
  assert.equal(grid.props.className, "stash-composables-selection-grid");
  assert.equal(grid.children.length, 1);

  const empty = renderSelectableGrid({ React }, {
    emptyMessage: "Nothing here",
    getItemId: (item) => item.id,
    items: [],
    onSelectChange: () => {},
    renderItemBody: (item) => React.createElement("span", null, item.title),
    selectedIds: new Set(),
  });

  assert.equal(empty.props.className, "stash-composables-selection-empty");
});

test("renderSelectableTable renders headers, rows, and empty state", () => {
  const React = createFakeReact();

  const table = renderSelectableTable({ React }, {
    columns: [
      {
        header: "Title",
        key: "title",
        renderCell: (item) => item.title,
      },
    ],
    emptyMessage: "Nothing here",
    getItemId: (item) => item.id,
    items: [{ id: "a", title: "Alpha" }],
    onSelectChange: () => {},
    selectedIds: new Set(),
  });

  assert.equal(table.type, "table");
  assert.equal(table.props.className, "table stash-composables-selection-table");
  assert.equal(table.children.length, 2);

  const empty = renderSelectableTable({ React }, {
    columns: [
      {
        header: "Title",
        key: "title",
        renderCell: (item) => item.title,
      },
    ],
    emptyMessage: "Nothing here",
    getItemId: (item) => item.id,
    items: [],
    onSelectChange: () => {},
    selectedIds: new Set(),
  });

  assert.equal(empty.props.className, "stash-composables-selection-empty");
});
