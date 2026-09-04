export function listItemIds(items) {
  return (items ?? []).map((item) => item.id);
}

export function clampSelectedIds(selectedIds, items) {
  const available = new Set(listItemIds(items));
  return new Set(Array.from(selectedIds ?? []).filter((id) => available.has(id)));
}

export function toggleSelectedId(selectedIds, id, selected) {
  const next = new Set(selectedIds ?? []);
  if (selected) {
    next.add(id);
  } else {
    next.delete(id);
  }
  return next;
}

export function selectAllIds(items) {
  return new Set(listItemIds(items));
}

export function clearSelectedIds() {
  return new Set();
}

export function getDisplayMode(value, fallback = "grid") {
  return value === "list" ? "list" : fallback;
}

export function removeSelectedItems(items, selectedIds) {
  const excluded = new Set(selectedIds ?? []);
  return (items ?? []).filter((item) => !excluded.has(item.id));
}

export function moveSelectedItems(items, selectedIds, direction) {
  const selected = new Set(selectedIds ?? []);
  if (!selected.size) {
    return items ?? [];
  }

  const next = [...(items ?? [])];

  if (direction < 0) {
    for (let index = 1; index < next.length; index += 1) {
      if (selected.has(next[index].id) && !selected.has(next[index - 1].id)) {
        const swap = next[index - 1];
        next[index - 1] = next[index];
        next[index] = swap;
      }
    }
    return next;
  }

  for (let index = next.length - 2; index >= 0; index -= 1) {
    if (selected.has(next[index].id) && !selected.has(next[index + 1].id)) {
      const swap = next[index + 1];
      next[index + 1] = next[index];
      next[index] = swap;
    }
  }

  return next;
}

export function getSelectionSummary(selectedIds, items) {
  const selected = clampSelectedIds(selectedIds, items);
  return {
    selectedCount: selected.size,
    totalCount: (items ?? []).length,
    hasSelection: selected.size > 0,
  };
}
