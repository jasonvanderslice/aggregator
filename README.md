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
