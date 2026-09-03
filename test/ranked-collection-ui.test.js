import test from "node:test";
import assert from "node:assert/strict";

import {
  createEntityPresentation,
  renderRankedCollectionSurface,
} from "../src/index.js";

function createFakeReact() {
  return {
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children };
    },
  };
}

test("renderRankedCollectionSurface renders score-ordered hydrated records", () => {
  const React = createFakeReact();
  const presentation = createEntityPresentation({
    adapter: {
      entityType: "scene",
      keyOf: (record) => record.item.id,
      titleOf: (record) => `${record.item.title} (${record.score})`,
    },
  });

  const element = renderRankedCollectionSurface(
    { React, Spinner: "spinner" },
    {
      title: "For You",
      ranked: [
        { key: "scene-b", score: 0.5 },
        { key: "scene-a", score: 1 },
      ],
      items: [
        { id: "scene-a", title: "A" },
        { id: "scene-b", title: "B" },
      ],
      keyOf: (scene) => scene.id,
      presentation,
    }
  );

  const items = element.children[1];
  assert.equal(items.type, "div");
  assert.equal(items.children[0].children[1].children[0].children[0], "A (1)");
  assert.equal(items.children[1].children[1].children[0].children[0], "B (0.5)");
});

test("renderRankedCollectionSurface renders sort and pagination controls", () => {
  const React = createFakeReact();
  const changes = [];
  const onPageChange = (page) => changes.push(["page", page]);
  const onPageSizeChange = (pageSize) => changes.push(["pageSize", pageSize]);
  const onSortChange = (sort) => changes.push(["sort", sort]);

  const element = renderRankedCollectionSurface(
    { React, Spinner: "spinner" },
    {
      items: [
        { id: "scene-a", title: "A" },
        { id: "scene-b", title: "B" },
        { id: "scene-c", title: "C" },
      ],
      keyOf: (scene) => scene.id,
      pagination: {
        onPageChange,
        onPageSizeChange,
        page: 1,
        pageSize: 2,
        pageSizeOptions: [2, 4],
      },
      ranked: [
        { key: "scene-a", score: 1 },
        { key: "scene-b", score: 0.5 },
        { key: "scene-c", score: 0.25 },
      ],
      sort: {
        onChange: onSortChange,
        options: [
          { label: "Recommended", value: "score" },
          { label: "Title", value: "title" },
        ],
        value: "score",
      },
      title: "For You",
    }
  );

  const controls = element.children[0].children[1].children[0];
  assert.equal(controls.props.className, "stash-composables-ranked-controls");
  assert.equal(controls.children[0].props.value, "score");
  controls.children[0].props.onChange({ target: { value: "title" } });
  assert.equal(controls.children[1].children[0], "1-2 of 3");
  controls.children[1].children[2].props.onClick();
  assert.equal(controls.children[2].props.value, "2");
  controls.children[2].props.onChange({ target: { value: "4" } });
  assert.deepEqual(changes, [["sort", "title"], ["page", 2], ["pageSize", 4]]);
});
