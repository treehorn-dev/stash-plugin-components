function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)])
    );
  }

  return value;
}

function createSceneTabState(value) {
  const nextValue = cloneValue(value ?? null);
  return {
    mode: "view",
    saving: false,
    error: null,
    value: nextValue,
    draft: cloneValue(nextValue),
  };
}

export function getSceneTabActions(state) {
  if (state?.mode === "edit") {
    return [
      {
        id: "save",
        label: "Save",
        disabled: Boolean(state?.saving),
      },
      {
        id: "cancel",
        label: "Cancel",
        disabled: Boolean(state?.saving),
      },
    ];
  }

  return [{ id: "edit", label: "Edit", disabled: false }];
}

export function createSceneTabController({ initialValue = null, onSave } = {}) {
  if (typeof onSave !== "function") {
    throw new TypeError("createSceneTabController requires an onSave function");
  }

  let state = createSceneTabState(initialValue);

  function setState(nextState) {
    state = nextState;
    return state;
  }

  return {
    cancel() {
      return setState(createSceneTabState(state.value));
    },
    edit() {
      return setState({
        ...state,
        mode: "edit",
        saving: false,
        error: null,
        draft: cloneValue(state.value),
      });
    },
    getState() {
      return state;
    },
    async save() {
      if (state.mode !== "edit" || state.saving) {
        return state.value;
      }

      const draft = cloneValue(state.draft);
      setState({
        ...state,
        saving: true,
        error: null,
      });

      try {
        const value = await onSave(draft);
        return setState(createSceneTabState(value));
      } catch (error) {
        setState({
          ...state,
          mode: "edit",
          saving: false,
          error,
          draft,
        });
        throw error;
      }
    },
    updateDraft(nextDraft) {
      return setState({
        ...state,
        mode: "edit",
        error: null,
        draft: cloneValue(nextDraft),
      });
    },
  };
}

export function createSceneTabRegistration({ key, title, createController } = {}) {
  if (!key) {
    throw new TypeError("createSceneTabRegistration requires a key");
  }

  if (!title) {
    throw new TypeError("createSceneTabRegistration requires a title");
  }

  if (typeof createController !== "function") {
    throw new TypeError("createSceneTabRegistration requires a createController function");
  }

  return {
    key: String(key),
    eventKey: String(key),
    title: String(title),
    createController,
  };
}
