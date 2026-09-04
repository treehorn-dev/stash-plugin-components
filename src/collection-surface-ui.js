import { renderModeSurfaceItem } from "./mode-renderer.js";

export function renderCollectionSurface(runtime, props) {
  const { React, Spinner } = runtime;
  const items = Array.isArray(props.items) ? props.items : [];
  const displayMode = props.displayMode ?? "grid";
  const Heading = props.headingElement ?? "h1";

  return React.createElement(
    "div",
    { className: "stash-composables-collection" },
    React.createElement(
      "div",
      { className: "stash-composables-collection__header" },
      React.createElement(
        "div",
        { className: "stash-composables-collection__meta" },
        React.createElement(Heading, null, props.title),
        props.description ? React.createElement("div", null, props.description) : null
      ),
      props.renderActions ? props.renderActions() : null
    ),
    props.loading
      ? React.createElement(Spinner, { animation: "border" })
      : items.length
        ? React.createElement(
            "div",
            {
              className: [ "stash-composables-collection__items", props.itemsClassName ]
                .filter(Boolean)
                .join(" "),
            },
            ...items.map((item, index) => {
              if (typeof props.renderItem === "function") {
                return props.renderItem(item, index);
              }

              if (props.presentation) {
                return renderModeSurfaceItem(runtime, {
                  context: {
                    ...(props.renderItemContext ?? {}),
                    index,
                  },
                  displayMode,
                  item,
                  presentation: props.presentation,
                });
              }

              return item;
            })
          )
        : React.createElement(
            "div",
            { className: "stash-composables-collection__empty" },
            props.emptyMessage ?? "No items yet."
          )
  );
}
