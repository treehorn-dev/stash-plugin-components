import {
  filterRankedItems,
  paginateRankedItems,
  resolveRankedItems,
  sortRankedItems,
} from "./ranked-collection-model.js";
import { renderCollectionSurface } from "./collection-surface-ui.js";

const defaultNumericOperators = ["gt", "gte", "lt", "lte", "eq", "is_null", "not_null"];
const nullOperators = new Set(["is_null", "not_null"]);

function numericOperatorOptions(field) {
  return Array.isArray(field.operators) && field.operators.length
    ? field.operators
    : defaultNumericOperators;
}

function renderNumericFilterField(React, field, onChange) {
  const value = field.value ?? {};
  const operator = value.operator ?? "gte";
  const controls = [
    React.createElement("label", null, field.label),
    React.createElement(
      "select",
      {
        value: operator,
        onChange: (event) => onChange?.(field.key, { ...value, operator: event.target.value }),
      },
      ...numericOperatorOptions(field).map((operatorValue) => React.createElement(
        "option",
        { key: operatorValue, value: operatorValue },
        operatorValue
      ))
    ),
  ];

  if (!nullOperators.has(operator)) {
    controls.push(React.createElement("input", {
      type: "number",
      value: String(value.value ?? ""),
      onChange: (event) => onChange?.(field.key, {
        ...value,
        value: Number(event.target.value),
      }),
    }));
  }

  return React.createElement("div", { key: field.key }, ...controls);
}

function renderNumericFilters(React, filters) {
  const fields = Array.isArray(filters?.fields) ? filters.fields : [];
  if (!fields.length) {
    return null;
  }

  return React.createElement(
    "div",
    { className: "stash-composables-ranked-controls__filters" },
    ...fields.map((field) => renderNumericFilterField(React, field, filters.onChange))
  );
}

function renderRankedControls(React, sort, pagination, page, filters) {
  const sortOptions = Array.isArray(sort?.options) ? sort.options : [];
  const pageSizeOptions = Array.isArray(pagination?.pageSizeOptions)
    ? pagination.pageSizeOptions
    : [];
  const numericFilters = renderNumericFilters(React, filters);
  if (!sortOptions.length && !pagination && !numericFilters) {
    return null;
  }

  const controls = [
    numericFilters,
    sortOptions.length
      ? React.createElement(
          "select",
          {
            "aria-label": "Sort recommendations",
            onChange: (event) => sort.onChange?.(event.target.value),
            value: sort.value,
          },
          ...sortOptions.map((option) => React.createElement(
            "option",
            { key: option.value, value: option.value },
            option.label
          ))
        )
      : null,
    pagination
      ? React.createElement(
          "div",
          { className: "stash-composables-ranked-controls__paging" },
          `${page.start}-${page.end} of ${page.total}`,
          React.createElement(
            "button",
            {
              "aria-label": "Previous page",
              disabled: page.page <= 1,
              onClick: () => pagination.onPageChange?.(page.page - 1),
              type: "button",
            },
            "Previous"
          ),
          React.createElement(
            "button",
            {
              "aria-label": "Next page",
              disabled: page.page >= page.pageCount,
              onClick: () => pagination.onPageChange?.(page.page + 1),
              type: "button",
            },
            "Next"
          )
        )
      : null,
    pagination && pageSizeOptions.length
      ? React.createElement(
          "select",
          {
            "aria-label": "Items per page",
            onChange: (event) => pagination.onPageSizeChange?.(Number(event.target.value)),
            value: String(page.pageSize),
          },
          ...pageSizeOptions.map((pageSize) => React.createElement(
            "option",
            { key: pageSize, value: String(pageSize) },
            `${pageSize} per page`
          ))
        )
      : null
  ].filter(Boolean);

  return React.createElement(
    "div",
    { className: "stash-composables-ranked-controls" },
    ...controls
  );
}

export function renderRankedCollectionSurface(runtime, props = {}) {
  const resolved = resolveRankedItems(props.ranked, props.items, props.keyOf);
  const filtered = filterRankedItems(resolved, props.filterRecord);
  const sorted = sortRankedItems(filtered, props.sort?.compare);
  const page = paginateRankedItems(sorted, props.pagination);
  const controls = renderRankedControls(runtime.React, props.sort, props.pagination, page, props.filters);

  return renderCollectionSurface(runtime, {
    ...props,
    items: page.items,
    renderActions: controls || props.renderActions
      ? () => runtime.React.createElement(
          "div",
          { className: "stash-composables-ranked-actions" },
          controls,
          props.renderActions ? props.renderActions() : null
        )
      : undefined,
    renderItemContext: {
      ...(props.renderItemContext ?? {}),
      totalRankedItems: page.total,
    },
  });
}
