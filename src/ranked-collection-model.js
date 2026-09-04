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

export function sortRankedItems(items, comparator) {
  const source = Array.isArray(items) ? items : [];
  if (typeof comparator !== "function") {
    return [...source];
  }

  return source
    .map((item, index) => ({ item, index }))
    .sort((left, right) => Number(comparator(left.item, right.item)) || left.index - right.index)
    .map(({ item }) => item);
}

export function paginateRankedItems(items, options = {}) {
  const source = Array.isArray(items) ? items : [];
  const pageSize = Math.max(1, Number(options.pageSize ?? source.length) || 1);
  const pageCount = Math.max(1, Math.ceil(source.length / pageSize));
  const page = Math.min(pageCount, Math.max(1, Number(options.page ?? 1) || 1));
  const start = (page - 1) * pageSize;
  const itemsOnPage = source.slice(start, start + pageSize);

  return {
    end: source.length ? start + itemsOnPage.length : 0,
    items: itemsOnPage,
    page,
    pageCount,
    pageSize,
    start: source.length ? start + 1 : 0,
    total: source.length,
  };
}
