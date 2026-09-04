# Ranked Collection Surface Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reusable ranked collection model and surface for plugins whose results have an external, deterministic order.

**Architecture:** The model owns rank normalization, stable ordering, filtering, and pagination without knowing about Stash scene data. The surface delegates visual presentation to the existing collection and entity-presentation seams. Consumers hydrate their own entities, then pass an ordered result set and any caller-owned controls.

**Tech Stack:** Browser ES modules, host-provided React, Node built-in test runner.

### Task 1: Ranked collection model

**Files:**
- Create: `src/ranked-collection-model.js`
- Create: `test/ranked-collection-model.test.js`
- Modify: `src/index.js`

**Step 1:** Add a failing test that ranks known items by external scores, preserves incoming order for score ties, and drops keys absent from the hydrated item map.

**Step 2:** Run `node --test test/ranked-collection-model.test.js` and confirm failure because the module does not exist.

**Step 3:** Implement `resolveRankedItems(ranked, items, keyOf)` with immutable inputs and deterministic tie handling.

**Step 4:** Run the focused test and confirm it passes.

**Step 5:** Add failing tests for predicate filtering and pagination, then implement `filterRankedItems` and `paginateRankedItems`.

**Step 6:** Run the focused test and confirm it passes.

**Step 7:** Export the helpers from `src/index.js`, run `npm test`, then commit.

### Task 2: Ranked collection surface

**Files:**
- Create: `src/ranked-collection-ui.js`
- Create: `test/ranked-collection-ui.test.js`
- Modify: `src/index.js`
- Modify: `test/browser-bundle.test.js`

**Step 1:** Add a failing test that renders a standard collection surface from ranked records using the caller's entity presentation.

**Step 2:** Run `node --test test/ranked-collection-ui.test.js` and confirm failure because the surface does not exist.

**Step 3:** Implement `renderRankedCollectionSurface(runtime, props)`: resolve ranked items, optionally filter and paginate, then delegate to `renderCollectionSurface`. The presentation receives ranked records of shape `{ entry, item, score }`.

**Step 4:** Run the focused test and confirm it passes.

**Step 5:** Export the surface, assert it is exposed by the browser bundle, run `npm test && npm run build`, then commit.

### Task 3: Consumer integration contract

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-09-03-ranked-collection-surface-implementation.md`

**Step 1:** Document how a consumer resolves Stash candidates with one `findScenes(scene_ids: ...)` request and gives the ordered results to the ranked surface.

**Step 2:** Document the boundary: Stash native scene filters are not exposed as reusable controls; consumers own their filter state and use the same GraphQL `SceneFilterType` when needed.

**Step 3:** Run `npm test && npm run build && git diff --check`, then commit.
