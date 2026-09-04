function getRuntime(runtime) {
  if (!runtime?.React) {
    throw new Error("Selection surface UI requires a React runtime");
  }

  return runtime;
}

function getLabels(labels = {}) {
  return {
    grid: labels.grid ?? "Grid",
    list: labels.list ?? "List",
    moveDown: labels.moveDown ?? "Move down",
    moveUp: labels.moveUp ?? "Move up",
    removeSelected: labels.removeSelected ?? "Remove selected",
    selectAll: labels.selectAll ?? "Select all",
    selectNone: labels.selectNone ?? "Select none",
  };
}

export function renderSelectionToolbar(runtime, props) {
  const { React, Button, ButtonGroup } = getRuntime(runtime);
  const labels = getLabels(props.labels);
  const hasSelection = Boolean(props.hasSelection);

  return React.createElement(
    "div",
    { className: "stash-composables-selection-toolbar" },
    React.createElement(
      ButtonGroup,
      null,
      React.createElement(
        Button,
        {
          onClick: props.onSelectAll,
          variant: "secondary",
        },
        labels.selectAll
      ),
      React.createElement(
        Button,
        {
          onClick: props.onSelectNone,
          variant: "secondary",
        },
        labels.selectNone
      )
    ),
    React.createElement(
      ButtonGroup,
      null,
      React.createElement(
        Button,
        {
          disabled: !hasSelection,
          onClick: props.onMoveUp,
          variant: "secondary",
        },
        labels.moveUp
      ),
      React.createElement(
        Button,
        {
          disabled: !hasSelection,
          onClick: props.onMoveDown,
          variant: "secondary",
        },
        labels.moveDown
      ),
      React.createElement(
        Button,
        {
          disabled: !hasSelection,
          onClick: props.onRemoveSelected,
          variant: "danger",
        },
        labels.removeSelected
      )
    ),
    React.createElement(
      ButtonGroup,
      null,
      React.createElement(
        Button,
        {
          onClick: () => props.onSetDisplayMode("grid"),
          variant: props.displayMode === "grid" ? "primary" : "secondary",
        },
        labels.grid
      ),
      React.createElement(
        Button,
        {
          onClick: () => props.onSetDisplayMode("list"),
          variant: props.displayMode === "list" ? "primary" : "secondary",
        },
        labels.list
      )
    )
  );
}

export function renderSelectableGrid(runtime, props) {
  const { React } = getRuntime(runtime);

  if (!props.items?.length) {
    return React.createElement(
      "div",
      { className: "stash-composables-selection-empty" },
      props.emptyMessage ?? "No items."
    );
  }

  return React.createElement(
    "div",
    { className: "stash-composables-selection-grid" },
    props.items.map((item) => {
      const id = props.getItemId(item);
      const selected = props.selectedIds?.has(id) ?? false;

      return React.createElement(
        "div",
        {
          className: `stash-composables-selection-card${selected ? " is-selected" : ""}`,
          key: id,
        },
        React.createElement(
          "label",
          { className: "stash-composables-selection-card__select" },
          React.createElement("input", {
            checked: selected,
            onChange: (event) =>
              props.onSelectChange(id, event.currentTarget.checked, false),
            type: "checkbox",
          })
        ),
        React.createElement(
          "div",
          { className: "stash-composables-selection-card__body" },
          props.renderItemBody(item)
        )
      );
    })
  );
}

export function renderSelectableTable(runtime, props) {
  const { React } = getRuntime(runtime);

  if (!props.items?.length) {
    return React.createElement(
      "div",
      { className: "stash-composables-selection-empty" },
      props.emptyMessage ?? "No items."
    );
  }

  return React.createElement(
    "table",
    { className: "table stash-composables-selection-table" },
    React.createElement(
      "thead",
      null,
      React.createElement(
        "tr",
        null,
        React.createElement("th", null, ""),
        props.columns.map((column) =>
          React.createElement("th", { key: column.key }, column.header)
        )
      )
    ),
    React.createElement(
      "tbody",
      null,
      props.items.map((item) => {
        const id = props.getItemId(item);
        const selected = props.selectedIds?.has(id) ?? false;

        return React.createElement(
          "tr",
          {
            className: selected ? "is-selected" : "",
            key: id,
          },
          React.createElement(
            "td",
            null,
            React.createElement("input", {
              checked: selected,
              onChange: (event) =>
                props.onSelectChange(id, event.currentTarget.checked, false),
              type: "checkbox",
            })
          ),
          props.columns.map((column) =>
            React.createElement("td", { key: column.key }, column.renderCell(item))
          )
        );
      })
    )
  );
}
