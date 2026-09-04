const DEFAULT_DISPLAY_MODES = Object.freeze(["grid", "list", "wall"]);

export function getDefaultDisplayModes() {
  return [...DEFAULT_DISPLAY_MODES];
}

export function createEntityPresentation(input = {}) {
  if (!input.adapter || typeof input.adapter !== "object") {
    throw new TypeError("createEntityPresentation requires an adapter");
  }

  const supportedModes = Array.isArray(input.supportedModes) && input.supportedModes.length
    ? [...input.supportedModes]
    : getDefaultDisplayModes();

  const renderers = {};
  for (const mode of supportedModes) {
    renderers[mode] = input.renderers?.[mode] ?? createDefaultModeRenderer(mode);
  }

  return {
    adapter: input.adapter,
    renderers,
    supportedModes,
  };
}

export function resolveModeRenderer(presentation, displayMode = "grid") {
  if (!presentation || typeof presentation !== "object") {
    throw new TypeError("resolveModeRenderer requires a presentation");
  }

  if (presentation.renderers?.[displayMode]) {
    return presentation.renderers[displayMode];
  }

  const fallbackMode = presentation.supportedModes?.[0] ?? "grid";
  if (presentation.renderers?.[fallbackMode]) {
    return presentation.renderers[fallbackMode];
  }

  return createDefaultModeRenderer(fallbackMode);
}

export function renderModeSurfaceItem(runtime, options = {}) {
  const renderer = resolveModeRenderer(options.presentation, options.displayMode);
  return renderer(runtime, options);
}

function createDefaultModeRenderer(mode) {
  return function renderDefaultMode(runtime, options = {}) {
    const { React } = runtime;
    const { adapter } = options.presentation;
    const context = options.context ?? {};
    const item = options.item;
    const image = adapter.imageOf?.(item, context) ?? null;
    const title = adapter.titleOf?.(item, context) ?? "";
    const meta = normalizeList(adapter.metaOf?.(item, context));
    const stats = normalizeList(adapter.statsOf?.(item, context));
    const badges = normalizeList(adapter.badgesOf?.(item, context));
    const key = adapter.keyOf?.(item, context) ?? context.index ?? title;

    return React.createElement(
      "article",
      {
        className: `stash-composables-mode-card stash-composables-mode-card--${mode}`,
        key,
      },
      image
        ? React.createElement("img", {
            alt: "",
            className: "stash-composables-mode-card__image",
            loading: "lazy",
            src: image,
          })
        : null,
      React.createElement(
        "div",
        { className: "stash-composables-mode-card__body" },
        React.createElement(
          "div",
          { className: "stash-composables-mode-card__title" },
          title
        ),
        meta.length
          ? React.createElement(
              "div",
              { className: "stash-composables-mode-card__meta" },
              ...meta.map((entry, index) =>
                React.createElement(
                  "div",
                  { key: `${key}-meta-${index}` },
                  stringifyMeta(entry)
                )
              )
            )
          : null,
        badges.length
          ? React.createElement(
              "div",
              { className: "stash-composables-mode-card__badges" },
              ...badges.map((badge, index) =>
                React.createElement(
                  "span",
                  {
                    className: "stash-composables-mode-card__badge",
                    key: `${key}-badge-${index}`,
                  },
                  stringifyBadge(badge)
                )
              )
            )
          : null,
        stats.length
          ? React.createElement(
              "div",
              { className: "stash-composables-mode-card__stats" },
              ...stats.map((stat, index) =>
                React.createElement(
                  "span",
                  {
                    className: "stash-composables-mode-card__stat",
                    key: `${key}-stat-${index}`,
                  },
                  stringifyStat(stat)
                )
              )
            )
          : null
      )
    );
  };
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (value === null || value === undefined || value === "") {
    return [];
  }

  return [value];
}

function stringifyMeta(entry) {
  if (typeof entry === "string" || typeof entry === "number") {
    return String(entry);
  }

  if (entry && typeof entry === "object") {
    if (entry.label && entry.value !== undefined) {
      return `${entry.label}: ${entry.value}`;
    }

    if (entry.value !== undefined) {
      return String(entry.value);
    }
  }

  return "";
}

function stringifyBadge(entry) {
  if (typeof entry === "string" || typeof entry === "number") {
    return String(entry);
  }

  if (entry && typeof entry === "object") {
    return entry.label ?? "";
  }

  return "";
}

function stringifyStat(entry) {
  if (typeof entry === "string" || typeof entry === "number") {
    return String(entry);
  }

  if (entry && typeof entry === "object") {
    if (entry.label && entry.value !== undefined) {
      return `${entry.label}: ${entry.value}`;
    }

    if (entry.value !== undefined) {
      return String(entry.value);
    }
  }

  return "";
}
