# stash-plugin-components

Reusable UI primitives for Stash-adjacent plugins.

The package is intentionally split into:
- headless state helpers
- thin view shells
- mode-based entity presentation helpers

The goal is not to invent a new UI model. It is to follow the same broad
convention Stash already uses for collection pages:
- a collection shell
- a display mode
- an entity-specific renderer for that mode

## Design Goals

- entity agnostic
- works for both core-like and plugin-owned types
- host-driven runtime, no bundled React or Bootstrap
- no Stash core patch required
- sane defaults first, custom overrides only where needed

## Runtime Model

All UI helpers are host-driven. Callers pass the runtime they already have,
typically from Stash plugin globals:

- `React`
- `Button`
- `ButtonGroup`
- `Spinner`
- `Form`

## Renderer Seam

The main seam for collection rendering is:

1. a collection shell
2. an entity presentation
3. a display mode

The collection shell is `renderCollectionSurface(runtime, props)`.

The entity presentation is created with `createEntityPresentation(...)`.

### Display Modes

`getDefaultDisplayModes()` returns:

```js
["grid", "list", "wall"]
```

These are mode names, not promises that every entity supports every mode.
Each presentation declares the modes it supports.

### Entity Adapter Contract

At minimum, provide an adapter:

```js
const presentation = createEntityPresentation({
  adapter: {
    entityType: "playlist",
    keyOf: (item) => item.id,
    titleOf: (item) => item.title,
  },
});
```

Optional adapter fields:

```js
{
  entityType: "playlist",
  keyOf: (item, context) => item.id,
  titleOf: (item, context) => item.title,
  imageOf: (item, context) => item.posterUrl ?? null,
  metaOf: (item, context) => [item.details],
  statsOf: (item, context) => [
    { label: "Items", value: item.itemCount },
    { label: "Duration", value: item.totalDurationSeconds },
  ],
  badgesOf: (item, context) => item.tagNames?.map((name) => ({ label: name })),
}
```

If you only provide an adapter, the package supplies default renderers for the
supported modes.

### Mode Overrides

When defaults are not enough, override only the mode you care about:

```js
const presentation = createEntityPresentation({
  adapter,
  supportedModes: ["grid", "list"],
  renderers: {
    grid(runtime, options) {
      return runtime.React.createElement(MyCustomCard, {
        key: options.item.id,
        item: options.item,
      });
    },
  },
});
```

That is the intended model:
- shared adapter metadata
- default renderers for commodity surfaces
- explicit overrides for rich entity-specific cards

## Collection Surface Usage

Legacy usage still works:

```js
renderCollectionSurface(runtime, {
  items,
  renderItem: (item) => React.createElement(MyCard, { item }),
  title: "Playlists",
});
```

New presentation-driven usage:

```js
renderCollectionSurface(runtime, {
  items,
  presentation,
  displayMode: "list",
  title: "Playlists",
});
```

If both `renderItem` and `presentation` are provided, `renderItem` wins. That
keeps old callers stable during migration.

## Supported Render Contexts

Right now the shared seam is centered on collection rendering:

- `collection.grid`
- `collection.list`
- `collection.wall`

The next logical shared surfaces are:
- picker results
- related-entity inline lists
- detail-page related sections

Those should reuse the same adapter metadata where practical.

## Exports

Headless state:
- `clearPickerSelection`
- `clampSelectedIds`
- `clearSelectedIds`
- `createSearchPickerState`
- `getDisplayMode`
- `getSelectionSummary`
- `listItemIds`
- `moveSelectedItems`
- `rejectSearchPickerResults`
- `removeSelectedItems`
- `resolveSearchPickerResults`
- `selectAllIds`
- `selectPickerRecord`
- `setSearchPickerLoading`
- `setSearchPickerQuery`
- `shouldShowSearchPickerResults`
- `toggleSelectedId`

Collection and renderer seam:
- `createEntityPresentation`
- `getDefaultDisplayModes`
- `renderCollectionSurface`
- `renderModeSurfaceItem`
- `resolveModeRenderer`

Other UI helpers:
- `createSceneTabController`
- `createSceneTabRegistration`
- `getSceneTabActions`
- `renderRelatedEntityList`
- `renderSearchPickerSurface`
- `renderSelectableGrid`
- `renderSelectableTable`
- `renderSelectionToolbar`

## Styling

The default stylesheet is [`src/stash-surface.css`](./src/stash-surface.css).
It includes:
- selection surfaces
- search picker surfaces
- collection shells
- default mode cards for `grid`, `list`, and `wall`

The classes are intentionally plain and override-friendly so downstream plugins
can tighten layout or match a richer entity-specific look without forking the
behavior layer.
