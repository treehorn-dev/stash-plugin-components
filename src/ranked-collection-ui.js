import {
  filterRankedItems,
  paginateRankedItems,
  resolveRankedItems,
} from "./ranked-collection-model.js";
import { renderCollectionSurface } from "./collection-surface-ui.js";

export function renderRankedCollectionSurface(runtime, props = {}) {
  const resolved = resolveRankedItems(props.ranked, props.items, props.keyOf);
  const filtered = filterRankedItems(resolved, props.filterRecord);
  const page = paginateRankedItems(filtered, props.pagination);

  return renderCollectionSurface(runtime, {
    ...props,
    items: page.items,
    renderItemContext: {
      ...(props.renderItemContext ?? {}),
      totalRankedItems: page.total,
    },
  });
}
