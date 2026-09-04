import { renderRelatedEntityList } from "./related-entity-list-ui.js";

export function renderSearchPickerSurface(runtime, props) {
  const { React, Form, Button, Icon } = runtime;
  const selectedItems = Array.isArray(props.selectedItems) ? props.selectedItems : [];
  const results = Array.isArray(props.results) ? props.results : [];
  const renderThumb = (className, value) =>
    value
      ? React.createElement("img", {
          alt: "",
          className,
          loading: "lazy",
          src: value,
        })
      : null;

  return React.createElement(
    "div",
    { className: "stash-composables-search-picker" },
    selectedItems.length
      ? renderRelatedEntityList(
          { React, Button },
          {
            getItemKey: props.getSelectedItemKey ?? props.getResultKey ?? ((item) => item.id),
            items: selectedItems,
            onRemove: props.onClearSelection ?? null,
            removeLabel: props.selectedRemoveLabel ?? "Remove",
            renderActions: props.selectedActionLabel && props.onClearSelection
              ? () =>
                  React.createElement(
                    Button,
                    {
                      onClick: props.onClearSelection,
                      variant: "secondary",
                    },
                    props.selectedActionLabel
                  )
              : null,
            renderLeading: props.renderSelectedThumb
              ? (item) =>
                  renderThumb(
                    "stash-composables-search-picker__thumb",
                    props.renderSelectedThumb(item)
                  )
              : null,
            renderMeta: props.renderSelectedMeta ?? (() => null),
            renderTitle: props.renderSelectedTitle ?? ((item) => item.title ?? item.name ?? item.id),
          }
        )
      : null,
    React.createElement(
      "div",
      { className: "stash-composables-search-picker__input" },
      React.createElement(Form.Control, {
        onChange: (event) => props.onQueryChange(event.currentTarget.value),
        placeholder: props.inputPlaceholder ?? "Search",
        value: props.query ?? "",
      }),
      Icon ? React.createElement(Icon, { icon: props.icon }) : null,
      props.action
        ? React.createElement(
            Button,
            {
              disabled: Boolean(props.action.disabled),
              onClick: props.action.onClick,
              variant: props.action.variant ?? "secondary",
            },
            props.action.label
          )
        : null
    ),
    props.loading
      ? React.createElement(
          "div",
          { className: "stash-composables-search-picker__empty" },
          props.loadingMessage ?? "Loading..."
        )
      : props.showResults
        ? results.length
          ? React.createElement(
              "div",
              { className: "stash-composables-search-picker__results" },
              results.map((item) =>
                React.createElement(
                  "button",
                  {
                    className: "stash-composables-search-picker__result",
                    key: String((props.getResultKey ?? ((entry) => entry.id))(item)),
                    onClick: () => props.onSelectResult(item),
                    type: "button",
                  },
                  props.renderResultThumb
                    ? renderThumb(
                        "stash-composables-search-picker__thumb",
                        props.renderResultThumb(item)
                      )
                    : null,
                  React.createElement(
                    "div",
                    { className: "stash-composables-search-picker__result-main" },
                    React.createElement(
                      "strong",
                      null,
                      (props.renderResultTitle ??
                        ((entry) => entry.title ?? entry.name ?? entry.id))(item)
                    ),
                    props.renderResultMeta
                      ? React.createElement(
                          "div",
                          { className: "stash-composables-search-picker__meta" },
                          props.renderResultMeta(item)
                        )
                      : null
                  )
                )
              )
            )
          : React.createElement(
              "div",
              { className: "stash-composables-search-picker__empty" },
              props.emptyResultsMessage ?? "No results found."
            )
        : props.idleMessage
          ? React.createElement(
              "div",
              { className: "stash-composables-search-picker__empty" },
              props.idleMessage
            )
          : null
  );
}
