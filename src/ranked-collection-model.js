export function resolveRankedItems(ranked, items, keyOf) {
  if (typeof keyOf !== "function") {
    throw new TypeError("resolveRankedItems requires keyOf");
  }

  const itemByKey = new Map(
    (Array.isArray(items) ? items : []).map((item) => [String(keyOf(item)), item])
  );

  return (Array.isArray(ranked) ? ranked : [])
    .map((entry, index) => ({
      entry,
      index,
      item: itemByKey.get(String(entry?.key ?? "")),
      score: Number(entry?.score ?? 0),
    }))
    .filter(({ item }) => item !== undefined)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ entry, item, score }) => ({ entry, item, score }));
}

export function filterRankedItems(items, predicate) {
  if (typeof predicate !== "function") {
    return [...(Array.isArray(items) ? items : [])];
  }

  return (Array.isArray(items) ? items : []).filter(predicate);
}

export function paginateRankedItems(items, options = {}) {
  const source = Array.isArray(items) ? items : [];
  const pageSize = Math.max(1, Number(options.pageSize ?? source.length) || 1);
  const page = Math.max(1, Number(options.page ?? 1) || 1);
  const start = (page - 1) * pageSize;

  return {
    items: source.slice(start, start + pageSize),
    page,
    pageSize,
    total: source.length,
  };
}
