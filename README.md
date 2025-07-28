# Aggregator Utility

A simple, fire-and-forget data aggregation utility that automatically batches and aggregates data points over time.

## Overview

The aggregator is designed for high-volume data collection scenarios where you need to aggregate multiple data points into consolidated datasets. It automatically handles caching, timing, and aggregation behind the scenes.

## API

### `aggregateData(data, callback?)`

The main function for adding data to the aggregation queue.

- **`data`** (DataItem): The data object to aggregate
- **`callback`** (FlushCallback, optional): Function called when data is flushed

### `aggregateDataImmediate(dataArray)`

Immediately aggregates an array of data objects without caching.

- **`dataArray`** (DataItem[]): Array of data objects to aggregate
- **Returns**: AggregatedData - The aggregated result

## Types

```typescript
interface DataItem {
  [key: string]: any;
}

interface AggregatedData {
  [key: string]: any[];
}

type FlushCallback = (aggregatedData: AggregatedData) => void;
```

## Usage Examples

### Basic Usage - Fire and Forget

```typescript
import { aggregateData } from './aggregator';

// Just hammer the function repeatedly
for (let i = 0; i < 1000; i++) {
  aggregateData({ 
    userId: `user-${i}`,
    action: 'click',
    timestamp: Date.now()
  });
}
// Automatically flushes after 1000ms
```

### With Callback for Processing

```typescript
import { aggregateData } from './aggregator';

// Set up callback to handle aggregated results
aggregateData({ input: 'first' }, (result) => {
  console.log('Aggregated data:', result);
  // { input: ['first', 'second', 'third'] }
});

aggregateData({ input: 'second' });
aggregateData({ input: 'third' });
```

### Immediate Aggregation

```typescript
import { aggregateDataImmediate } from './aggregator';

const dataArray = [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' },
  { name: 'Bob', age: 35, city: 'NYC' }
];

const result = aggregateDataImmediate(dataArray);
console.log(result);
// {
//   name: ['John', 'Jane', 'Bob'],
//   age: [30, 25, 35],
//   city: ['NYC', 'LA', 'NYC']
// }
```

### Complex Data Aggregation

```typescript
import { aggregateData } from './aggregator';

// Different objects with different fields
aggregateData({ 
  event: 'page_view',
  userId: '123',
  page: '/home'
});

aggregateData({ 
  event: 'click',
  userId: '123',
  element: 'button'
});

aggregateData({ 
  event: 'scroll',
  userId: '456',
  depth: 75
});

// Result will include all fields from all objects
// {
//   event: ['page_view', 'click', 'scroll'],
//   userId: ['123', '123', '456'],
//   page: ['/home', undefined, undefined],
//   element: [undefined, 'button', undefined],
//   depth: [undefined, undefined, 75]
// }
```

## Key Features

### 🔥 Fire-and-Forget
- No setup required - just start calling the function
- No manual cache management needed
- No cleanup required

### ⏱️ Automatic Timing
- Automatically flushes every 1000ms (1 second)
- Timer resets with each new data point
- Cross-platform compatible (Node.js and browser)

### 📊 Dynamic Field Aggregation
- Automatically detects all fields present in data
- Handles objects with different field sets
- Preserves field order and structure

### 🚀 High Performance
- Designed for thousands of rapid calls
- Efficient memory usage
- Minimal overhead

### 🔄 Singleton Pattern
- Global state management
- Single instance across your application
- Consistent behavior

## Behavior

### Timer-Based Flushing
- Data is cached until the timer expires (1000ms)
- Timer resets with each new `aggregateData` call
- All cached data is flushed together

### Field Aggregation
- All unique fields from all data objects are included
- Missing fields are filled with `undefined`
- Arrays maintain the order of data addition

### Callback Invocation
- Callback is called once per flush cycle
- Receives the complete aggregated dataset
- Error handling is built-in

## Use Cases

- **Analytics**: Batch user interactions and events
- **Logging**: Aggregate log entries before sending
- **Monitoring**: Collect metrics and flush periodically
- **Forms**: Aggregate form field validations
- **Performance**: Batch API calls or operations

## Example: Analytics Tracking

```typescript
import { aggregateData } from './aggregator';

// Track user interactions
function trackEvent(eventName, properties = {}) {
  aggregateData({
    event: eventName,
    userId: getCurrentUserId(),
    timestamp: Date.now(),
    ...properties
  }, (aggregatedData) => {
    // Send to analytics service
    sendToAnalytics(aggregatedData);
  });
}

// Usage
trackEvent('page_view', { page: '/home' });
trackEvent('button_click', { button: 'submit' });
trackEvent('form_submit', { form: 'contact' });
```

## Notes

- The aggregator is a singleton - there's only one instance
- No manual cleanup is required
- Works in both Node.js and browser environments
- Designed for simplicity and performance 
