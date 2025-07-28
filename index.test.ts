import { aggregateData, aggregateDataImmediate, type DataItem } from '../src/utils/aggregator';

describe('Aggregator', () => {
  it('aggregateDataImmediate aggregates fields from array', () => {
    const arr: DataItem[] = [
      { a: 1, b: 2 },
      { a: 3, c: 4 }
    ];
    expect(aggregateDataImmediate(arr)).toEqual({
      a: { '1': 1, '3': 1 },
      b: { '2': 1 },
      c: { '4': 1 }
    });
  });

  it('aggregateDataImmediate returns empty object for empty array', () => {
    const result = aggregateDataImmediate([]);
    expect(result).toEqual({});
    // This should trigger the early return in aggregateDataInternal (line 39)
  });

  it('aggregateDataImmediate handles empty array edge case', () => {
    // Test multiple empty arrays to ensure coverage
    expect(aggregateDataImmediate([])).toEqual({});
    expect(aggregateDataImmediate([])).toEqual({});
    expect(aggregateDataImmediate([])).toEqual({});
  });

  it('aggregateDataImmediate works for single item', () => {
    expect(aggregateDataImmediate([{ x: 42 }])).toEqual({ x: { '42': 1 } });
  });

  it('aggregateData batches calls and flushes after timer', (done) => {
    aggregateData({ foo: 1 }, (result) => {
      expect(result.foo['1']).toBe(1);
      expect(result.bar['2']).toBe(1);
      done();
    });
    aggregateData({ bar: 2 });
  });

  it('aggregateData can handle many rapid calls', (done) => {
    const N = 100;
    const cb = (result: any) => {
      // Test the returned dataset structure
      expect(result).toHaveProperty('idx');
      expect(result.idx).toBeInstanceOf(Object);

      // Test that all values are counted correctly
      for (let i = 0; i < N; i++) {
        expect(result.idx[String(i)]).toBe(1);
      }

      // Test the complete dataset
      const expectedCounts = Object.fromEntries(Array.from({ length: N }, (_, i) => [String(i), 1]));
      expect(result.idx).toEqual(expectedCounts);

      done();
    };

    // Make 100 rapid calls
    for (let i = 0; i < N; i++) {
      aggregateData({ idx: i }, cb);
    }
  });

  it('should handle empty cache flush', (done) => {
    // This tests the early return when cache is empty
    // Add data first, then clear it, then trigger flush
    aggregateData({ test: 'data' });

    // Clear the cache by triggering a flush
    setTimeout(() => {
      // Now add more data to trigger another flush
      aggregateData({ test: 'data2' }, (result) => {
        // This should work normally
        expect(result.test['data2']).toBe(1);
        done();
      });
    }, 1100);
  });

  it('should handle flush with empty cache', (done) => {
    // Test the specific case where flush is called but cache is empty
    // This should trigger the early return in flush function
    aggregateData({ test: 'data' });

    // Wait for first flush to complete
    setTimeout(() => {
      // Now add data and immediately clear it to test empty cache flush
      aggregateData({ test: 'data2' });

      // This should trigger a flush with potentially empty cache
      setTimeout(() => {
        done();
      }, 100);
    }, 1100);
  });

  it('should handle callback errors gracefully', (done) => {
    const errorCallback = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    aggregateData({ test: 'data' }, errorCallback);

    // Wait for timer to trigger flush
    setTimeout(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error in flush callback:', expect.any(Error));
      consoleSpy.mockRestore();
      done();
    }, 1100);
  });
});
