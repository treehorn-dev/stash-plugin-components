import {
  filterRankedItems,
  paginateRankedItems,
  resolveRankedItems,
  sortRankedItems,
} from "./ranked-collection-model.js";
import { renderCollectionSurface } from "./collection-surface-ui.js";

function renderRankedControls(React, sort, pagination, page) {
  const sortOptions = Array.isArray(sort?.options) ? sort.options : [];
  const pageSizeOptions = Array.isArray(pagination?.pageSizeOptions)
    ? pagination.pageSizeOptions
    : [];
  if (!sortOptions.length && !pagination) {
    return null;
  }

  return React.createElement(
    "div",
    { className: "stash-composables-ranked-controls" },
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
  );
}

export function renderRankedCollectionSurface(runtime, props = {}) {
  const resolved = resolveRankedItems(props.ranked, props.items, props.keyOf);
  const filtered = filterRankedItems(resolved, props.filterRecord);
  const sorted = sortRankedItems(filtered, props.sort?.compare);
  const page = paginateRankedItems(sorted, props.pagination);
  const controls = renderRankedControls(runtime.React, props.sort, props.pagination, page);

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
