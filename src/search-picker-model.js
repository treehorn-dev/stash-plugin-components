function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)])
    );
  }

  return value;
}

export function createSearchPickerState({
  minQueryLength = 2,
  query = "",
  selected = null,
} = {}) {
  return {
    error: null,
    loading: false,
    minQueryLength,
    query: String(query),
    results: [],
    selected: cloneValue(selected),
  };
}

export function setSearchPickerQuery(state, query) {
  return {
    ...state,
    error: null,
    query: String(query),
    results: [],
  };
}

export function shouldShowSearchPickerResults(state) {
  return state.query.trim().length >= state.minQueryLength;
}

export function setSearchPickerLoading(state) {
  return {
    ...state,
    error: null,
    loading: true,
  };
}

export function resolveSearchPickerResults(state, results) {
  return {
    ...state,
    error: null,
    loading: false,
    results: Array.isArray(results) ? cloneValue(results) : [],
  };
}

export function rejectSearchPickerResults(state, error) {
  return {
    ...state,
    error,
    loading: false,
  };
}

export function selectPickerRecord(state, record) {
  return {
    ...state,
    error: null,
    results: [],
    selected: cloneValue(record),
  };
}

export function clearPickerSelection(state) {
  return {
    ...state,
    error: null,
    selected: null,
  };
}
