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
