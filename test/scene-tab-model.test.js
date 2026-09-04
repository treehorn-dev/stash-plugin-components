import test from "node:test";
import assert from "node:assert/strict";

import {
  createSceneTabController,
  createSceneTabRegistration,
  getSceneTabActions,
} from "../src/index.js";

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, reject, resolve };
}

test("scene tab controller defaults to view mode with an edit action", () => {
  const controller = createSceneTabController({
    initialValue: { title: "Original" },
    onSave: async (draft) => draft,
  });

  assert.deepEqual(controller.getState(), {
    mode: "view",
    saving: false,
    error: null,
    value: { title: "Original" },
    draft: { title: "Original" },
  });
  assert.deepEqual(getSceneTabActions(controller.getState()), [
    { id: "edit", label: "Edit", disabled: false },
  ]);
});

test("scene tab controller enters edit mode, updates draft, and cancels back to the last saved value", () => {
  const controller = createSceneTabController({
    initialValue: { title: "Original" },
    onSave: async (draft) => draft,
  });

  controller.edit();
  controller.updateDraft({ title: "Draft" });

  assert.equal(controller.getState().mode, "edit");
  assert.deepEqual(controller.getState().draft, { title: "Draft" });
  assert.deepEqual(getSceneTabActions(controller.getState()), [
    { id: "save", label: "Save", disabled: false },
    { id: "cancel", label: "Cancel", disabled: false },
  ]);

  controller.cancel();

  assert.deepEqual(controller.getState(), {
    mode: "view",
    saving: false,
    error: null,
    value: { title: "Original" },
    draft: { title: "Original" },
  });
});

test("scene tab controller marks save progress, commits the saved value, and returns to view mode", async () => {
  const deferred = createDeferred();
  const controller = createSceneTabController({
    initialValue: { title: "Original" },
    onSave: () => deferred.promise,
  });

  controller.edit();
  controller.updateDraft({ title: "Saved" });
  const savePromise = controller.save();

  assert.deepEqual(controller.getState(), {
    mode: "edit",
    saving: true,
    error: null,
    value: { title: "Original" },
    draft: { title: "Saved" },
  });
  assert.deepEqual(getSceneTabActions(controller.getState()), [
    { id: "save", label: "Save", disabled: true },
    { id: "cancel", label: "Cancel", disabled: true },
  ]);

  deferred.resolve({ title: "Saved", persisted: true });
  await savePromise;

  assert.deepEqual(controller.getState(), {
    mode: "view",
    saving: false,
    error: null,
    value: { title: "Saved", persisted: true },
    draft: { title: "Saved", persisted: true },
  });
});

test("scene tab controller keeps edit mode and exposes the save error when persistence fails", async () => {
  const controller = createSceneTabController({
    initialValue: { title: "Original" },
    onSave: async () => {
      throw new Error("save failed");
    },
  });

  controller.edit();
  controller.updateDraft({ title: "Broken" });

  await assert.rejects(() => controller.save(), /save failed/);

  assert.equal(controller.getState().mode, "edit");
  assert.equal(controller.getState().saving, false);
  assert.equal(controller.getState().error?.message, "save failed");
  assert.deepEqual(controller.getState().value, { title: "Original" });
  assert.deepEqual(controller.getState().draft, { title: "Broken" });
  assert.deepEqual(getSceneTabActions(controller.getState()), [
    { id: "save", label: "Save", disabled: false },
    { id: "cancel", label: "Cancel", disabled: false },
  ]);
});

test("scene tab registration normalizes the tab key, title, and controller factory", () => {
  const createController = () =>
    createSceneTabController({
      initialValue: null,
      onSave: async (draft) => draft,
    });

  assert.deepEqual(
    createSceneTabRegistration({
      key: "playlists",
      title: "Playlists",
      createController,
    }),
    {
      key: "playlists",
      eventKey: "playlists",
      title: "Playlists",
      createController,
    }
  );
});
