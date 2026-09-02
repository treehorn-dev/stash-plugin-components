# Mode Renderer Seam Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shared mode-renderer seam to `stash-plugin-components` that supports both core and plugin-owned entity types with sensible defaults, then migrate one real consumer to prove the contract.

**Architecture:** Keep the existing collection shell, but insert a renderer registry layer between the shell and entity-specific UI. Callers provide an entity adapter plus optional mode overrides. Default renderers handle the common `grid`, `list`, and `wall` cases from adapter metadata, while consumers can override specific modes when they need richer behavior.

**Tech Stack:** ESM JavaScript, Node test runner, browser bundle build script, Stash plugin UI runtime.

### Task 1: Define the renderer contract with tests

**Files:**
- Create: `/Users/allenday/src/treehorn-dev/stash-plugin-components/test/mode-renderer.test.js`
- Modify: `/Users/allenday/src/treehorn-dev/stash-plugin-components/src/index.js`

**Step 1: Write the failing test**

Add tests that describe:
- adapter-only rendering uses default renderers
- explicit mode override wins over default
- unsupported mode falls back predictably
- collection surface can delegate item rendering through the new seam

**Step 2: Run test to verify it fails**

Run: `npm test -- mode-renderer`
Expected: FAIL because the new exports and behavior do not exist yet.

**Step 3: Write minimal implementation**

Add a renderer module that exports:
- default display mode constants
- adapter normalization helpers
- a function to resolve a renderer for `entityType + mode`
- default renderers for `grid`, `list`, and `wall`

**Step 4: Run test to verify it passes**

Run: `npm test -- mode-renderer`
Expected: PASS

### Task 2: Integrate the seam with the existing collection shell

**Files:**
- Modify: `/Users/allenday/src/treehorn-dev/stash-plugin-components/src/collection-surface-ui.js`
- Modify: `/Users/allenday/src/treehorn-dev/stash-plugin-components/test/related-entity-list-ui.test.js`

**Step 1: Write the failing test**

Extend the collection surface tests to verify that a caller can pass:
- `displayMode`
- `presentation`
- `renderItemContext`

and the shell renders items through the resolved mode renderer.

**Step 2: Run test to verify it fails**

Run: `npm test -- related-entity-list-ui`
Expected: FAIL because `renderCollectionSurface` only supports `renderItem`.

**Step 3: Write minimal implementation**

Update `renderCollectionSurface` to support both:
- legacy `renderItem`
- new presentation-driven rendering

Keep backward compatibility for current consumers.

**Step 4: Run test to verify it passes**

Run: `npm test -- related-entity-list-ui`
Expected: PASS

### Task 3: Prove the seam in stash-playlists

**Files:**
- Modify: `/Users/allenday/src/treehorn-dev/stash-playlists/src/ui/playlist-view-model.js`
- Modify: `/Users/allenday/src/treehorn-dev/stash-playlists/test/playlist-view-model.test.js`
- Modify: `/Users/allenday/src/treehorn-dev/stash-playlists/test/vendor-composables.test.js`

**Step 1: Write the failing test**

Add tests that build a playlist presentation:
- adapter exposes title/details/poster/stats
- default mode rendering is sufficient for list or grid
- the vendored bundle still exposes the new API

**Step 2: Run test to verify it fails**

Run: `npm test -- playlist-view-model`
Expected: FAIL because the playlist presentation builder does not exist yet.

**Step 3: Write minimal implementation**

Create a playlist presentation helper that returns adapter metadata and uses default renderers unless the playlist UI needs a specific override.

**Step 4: Run test to verify it passes**

Run: `npm test -- playlist-view-model`
Expected: PASS

### Task 4: Document the public contract

**Files:**
- Modify: `/Users/allenday/src/treehorn-dev/stash-plugin-components/README.md`

**Step 1: Write the docs**

Document:
- the design intent
- the adapter contract
- the renderer override contract
- supported render contexts
- how core and custom entity types should use the seam

**Step 2: Verify docs align with exports**

Run: `npm test && npm run build`
Expected: PASS

### Task 5: Verify end-to-end package integrity

**Files:**
- Modify as needed based on test/build fallout

**Step 1: Run package tests**

Run: `npm test`
Expected: PASS in `stash-plugin-components`

**Step 2: Run package build**

Run: `npm run build`
Expected: PASS in `stash-plugin-components`

**Step 3: Run consumer tests**

Run: `npm test`
Expected: PASS in `stash-playlists`

**Step 4: Commit**

```bash
git add README.md docs/plans/2026-08-10-mode-renderer-seam-implementation.md src test
git commit -m "feat: add mode renderer seam"
```
