import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

const repoRoot = path.resolve(import.meta.dirname, "..");
const distPath = path.join(repoRoot, "dist", "stash-plugin-components.js");
const cssDistPath = path.join(repoRoot, "dist", "stash-plugin-components.css");

test("build-browser-bundle emits a browser asset exposing window.StashPluginComponents", () => {
  execFileSync("node", [path.join(repoRoot, "scripts", "build-browser-bundle.mjs")], {
    cwd: repoRoot,
    stdio: "pipe",
  });

  assert.equal(fs.existsSync(distPath), true);
  assert.equal(fs.existsSync(cssDistPath), true);

  const source = fs.readFileSync(distPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  assert.equal(typeof sandbox.window.StashPluginComponents, "object");
  assert.equal(
    typeof sandbox.window.StashPluginComponents.renderSelectionToolbar,
    "function"
  );
  assert.equal(
    typeof sandbox.window.StashPluginComponents.createEntityPresentation,
    "function"
  );
  assert.equal(
    typeof sandbox.window.StashPluginComponents.resolveModeRenderer,
    "function"
  );
  assert.equal(
    typeof sandbox.window.StashPluginComponents.moveSelectedItems,
    "function"
  );
  assert.equal(
    typeof sandbox.window.StashPluginComponents.renderRankedCollectionSurface,
    "function"
  );

  const cssSource = fs.readFileSync(cssDistPath, "utf8");
  assert.match(cssSource, /stash-composables-selection-toolbar/);
});
