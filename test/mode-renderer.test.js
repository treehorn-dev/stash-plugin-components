import test from "node:test";
import assert from "node:assert/strict";

import {
  createEntityPresentation,
  getDefaultDisplayModes,
  renderModeSurfaceItem,
  resolveModeRenderer,
} from "../src/index.js";

function createFakeReact() {
  return {
    createElement(type, props, ...children) {
      return {
        type,
        props: props ?? {},
        children,
      };
    },
  };
}

test("createEntityPresentation exposes adapter defaults for all standard display modes", () => {
  const presentation = createEntityPresentation({
    adapter: {
      entityType: "playlist",
      keyOf: (item) => item.id,
      titleOf: (item) => item.title,
      imageOf: (item) => item.posterUrl,
      metaOf: (item) => [item.details],
    },
  });

  assert.deepEqual(getDefaultDisplayModes(), ["grid", "list", "wall"]);
  assert.equal(presentation.supportedModes.includes("grid"), true);
  assert.equal(typeof presentation.renderers.grid, "function");
  assert.equal(typeof presentation.renderers.list, "function");
  assert.equal(typeof presentation.renderers.wall, "function");
});

test("resolveModeRenderer prefers explicit mode overrides over defaults", () => {
  const customRenderer = (runtime, context) =>
    runtime.React.createElement("custom-card", { id: context.item.id }, context.item.title);

  const presentation = createEntityPresentation({
    adapter: {
      entityType: "playlist",
      keyOf: (item) => item.id,
      titleOf: (item) => item.title,
    },
    renderers: {
      list: customRenderer,
    },
  });

  assert.equal(resolveModeRenderer(presentation, "list"), customRenderer);
  assert.notEqual(resolveModeRenderer(presentation, "grid"), customRenderer);
});

test("renderModeSurfaceItem uses the resolved renderer and adapter metadata", () => {
  const React = createFakeReact();
  const presentation = createEntityPresentation({
    adapter: {
      entityType: "playlist",
      keyOf: (item) => item.id,
      titleOf: (item) => item.title,
      imageOf: (item) => item.posterUrl,
      metaOf: (item) => [item.details],
      statsOf: (item) => [{ label: "Items", value: item.itemCount }],
    },
  });

  const element = renderModeSurfaceItem(
    { React },
    {
      displayMode: "grid",
      item: {
        id: "playlist-1",
        title: "Sampler",
        details: "A few scenes",
        posterUrl: "/scene/1/screenshot",
        itemCount: 3,
      },
      presentation,
    }
  );

  assert.equal(element.type, "article");
  assert.equal(element.props.className, "stash-composables-mode-card stash-composables-mode-card--grid");
});
