import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const distDir = path.join(repoRoot, "dist");
const distPath = path.join(distDir, "stash-plugin-components.js");
const cssDistPath = path.join(distDir, "stash-plugin-components.css");

const sources = [
  path.join(repoRoot, "src", "search-picker-model.js"),
  path.join(repoRoot, "src", "mode-renderer.js"),
  path.join(repoRoot, "src", "collection-surface-ui.js"),
  path.join(repoRoot, "src", "ranked-collection-model.js"),
  path.join(repoRoot, "src", "ranked-collection-ui.js"),
  path.join(repoRoot, "src", "scene-tab-model.js"),
  path.join(repoRoot, "src", "selection-surface-model.js"),
  path.join(repoRoot, "src", "related-entity-list-ui.js"),
  path.join(repoRoot, "src", "search-picker-ui.js"),
  path.join(repoRoot, "src", "selection-surface-ui.js"),
];

const exportedNames = [
  "clearPickerSelection",
  "createEntityPresentation",
  "createSceneTabController",
  "createSceneTabRegistration",
  "createSearchPickerState",
  "getDefaultDisplayModes",
  "renderCollectionSurface",
  "filterRankedItems",
  "paginateRankedItems",
  "renderRankedCollectionSurface",
  "clampSelectedIds",
  "clearSelectedIds",
  "getDisplayMode",
  "getSceneTabActions",
  "getSelectionSummary",
  "listItemIds",
  "moveSelectedItems",
  "rejectSearchPickerResults",
  "removeSelectedItems",
  "renderRelatedEntityList",
  "renderModeSurfaceItem",
  "renderSearchPickerSurface",
  "renderSelectableGrid",
  "renderSelectableTable",
  "renderSelectionToolbar",
  "resolveModeRenderer",
  "resolveRankedItems",
  "resolveSearchPickerResults",
  "selectAllIds",
  "selectPickerRecord",
  "setSearchPickerLoading",
  "setSearchPickerQuery",
  "shouldShowSearchPickerResults",
  "toggleSelectedId",
];

function stripModuleSyntax(source) {
  return source
    .replace(/^import\s+[\s\S]*?\s+from\s+["'][^"']+["'];\n/gm, "")
    .replace(/^export function /gm, "function ")
    .replace(/^export \{.+?\};?\n/gm, "");
}

const parts = await Promise.all(
  sources.map(async (filePath) => stripModuleSyntax(await fs.readFile(filePath, "utf8")))
);

const bundle = `(function (global) {
${parts.join("\n\n")}

  global.StashPluginComponents = {
    ${exportedNames.join(",\n    ")}
  };
})(typeof window !== "undefined" ? window : globalThis);
`;

await fs.mkdir(distDir, { recursive: true });
await fs.writeFile(distPath, bundle, "utf8");
await fs.copyFile(
  path.join(repoRoot, "src", "stash-surface.css"),
  cssDistPath
);
