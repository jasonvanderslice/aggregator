/**
 * Aggregated data structure
 */
export interface AggregatedData {
  [key: string]: any;
}

/**
 * Individual data item
 */
export interface DataItem {
  [key: string]: any;
}

/**
 * Callback function type for when aggregated data is ready
 */
export type FlushCallback = (aggregatedData: AggregatedData) => void;

/**
 * Internal state for the aggregator
 */
interface AggregatorState {
  cache: DataItem[];
  flushTimer: ReturnType<typeof setTimeout> | null;
  flushCallback?: FlushCallback;
}

/**
 * Global state for the singleton aggregator
 */
let globalState: AggregatorState | null = null;

/**
 * Aggregate multiple data items into a single aggregated structure
 */
const aggregateDataInternal = (dataArray: DataItem[]): AggregatedData => {
  if (dataArray.length === 0) {
    return {};
  }

  const aggregated: AggregatedData = {};

  // Get all unique keys from all data items
  const allKeys = new Set<string>();
  dataArray.forEach((data) => {
    Object.keys(data).forEach((key) => allKeys.add(key));
  });

  // Aggregate each field
  allKeys.forEach((key) => {
    aggregated[key] = [];

    dataArray.forEach((data) => {
      aggregated[key].push(data[key]);
    });
  });

  return aggregated;
};

/**
 * Internal flush function
 */
const flush = (state: AggregatorState): void => {
  if (state.cache.length === 0) {
    return;
  }

  // Clear the timer
  if (state.flushTimer) {
    clearTimeout(state.flushTimer);
    state.flushTimer = null;
  }

  // Aggregate the cached data
  const aggregatedData = aggregateDataInternal(state.cache);

  // Clear the cache
  state.cache = [];

  // Call the flush callback if provided
  if (state.flushCallback) {
    try {
      state.flushCallback(aggregatedData);
    } catch (error) {
      console.error('Error in flush callback:', error);
    }
  }
};

/**
 * Initialize the global aggregator state
 */
const initializeGlobalState = (flushCallback?: FlushCallback): AggregatorState => {
  if (!globalState) {
    globalState = {
      cache: [],
      flushTimer: null,
      flushCallback
    };
  } else if (flushCallback) {
    // Update callback if provided
    globalState.flushCallback = flushCallback;
  }
  return globalState;
};

/**
 * Main utility function - just call this repeatedly
 */
export const aggregateData = (data: DataItem, flushCallback?: FlushCallback): void => {
  const state = initializeGlobalState(flushCallback);

  // Add data to cache
  state.cache.push(data);

  // Start flush timer if not already running
  if (!state.flushTimer) {
    state.flushTimer = setTimeout(() => {
      flush(state);
    }, 1000);
  }
};

/**
 * Legacy function for immediate aggregation without caching
 */
export const aggregateDataImmediate = (dataArray: DataItem[]): AggregatedData => {
  return aggregateDataInternal(dataArray);
};
