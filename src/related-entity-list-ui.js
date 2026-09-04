function getRuntime(runtime) {
  if (!runtime?.React) {
    throw new Error("Related entity list UI requires a React runtime");
  }

  return runtime;
}

export function renderRelatedEntityList(runtime, props) {
  const { React, Button } = getRuntime(runtime);
  const items = Array.isArray(props.items) ? props.items : [];

  if (!items.length) {
    return React.createElement(
      "div",
      { className: "stash-composables-related-entity-list__empty" },
      props.emptyMessage ?? "No related items."
    );
  }

  return React.createElement(
    "div",
    { className: "stash-composables-related-entity-list" },
    ...items.map((item, index) => {
      const key = props.getItemKey ? props.getItemKey(item) : item.id ?? index;
      const title = props.renderTitle(item);
      const meta = props.renderMeta ? props.renderMeta(item) : null;
      const leading = props.renderLeading ? props.renderLeading(item) : null;
      const actions = props.renderActions ? props.renderActions(item) : null;
      const removeButton =
        Button && props.onRemove
          ? React.createElement(
              Button,
              {
                onClick: () => props.onRemove(item),
                variant: "secondary",
              },
              props.removeLabel ?? "Remove"
            )
          : null;

      return React.createElement(
        "div",
        {
          className: "stash-composables-related-entity-list__row",
          key,
        },
        leading,
        React.createElement(
          "div",
          { className: "stash-composables-related-entity-list__body" },
          React.createElement(
            "div",
            { className: "stash-composables-related-entity-list__title" },
            title
          ),
          meta
            ? React.createElement(
                "div",
                { className: "stash-composables-related-entity-list__meta" },
                meta
              )
            : null
        ),
        removeButton || actions
          ? React.createElement(
              "div",
              { className: "stash-composables-related-entity-list__actions" },
              removeButton,
              actions
            )
          : null
      );
    })
  );
}
