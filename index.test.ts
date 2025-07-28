import { aggregateData, aggregateDataImmediate, type DataItem } from '../src/utils/aggregator';

describe('Aggregator', () => {
  describe('aggregateData', () => {
    it('should handle multiple calls', () => {
      aggregateData({ input: 'first' });
      aggregateData({ input: 'second' });
      aggregateData({ input: 'third' });

      // Should not throw and should work with timer-based flushing
      expect(() => aggregateData({ input: 'fourth' })).not.toThrow();
    });
  });

  describe('aggregateDataImmediate', () => {
    it('should aggregate data immediately', () => {
      const dataArray: DataItem[] = [
        { input: 'firstName', isValid: true, isRequired: true },
        { input: 'lastName', isValid: true, isRequired: true },
        { input: 'email', isValid: false, isRequired: true }
      ];

      const result = aggregateDataImmediate(dataArray);

      expect(result).toEqual({
        input: ['firstName', 'lastName', 'email'],
        isValid: [true, true, false],
        isRequired: [true, true, true]
      });
    });

    it('should handle empty array', () => {
      const result = aggregateDataImmediate([]);
      expect(result).toEqual({});
    });

    it('should handle single item', () => {
      const dataArray: DataItem[] = [{ name: 'John', age: 30 }];
      const result = aggregateDataImmediate(dataArray);

      expect(result).toEqual({
        name: ['John'],
        age: [30]
      });
    });

    it('should handle different fields in different items', () => {
      const dataArray: DataItem[] = [
        { field1: 'value1', field2: 'value2' },
        { field2: 'value3', field3: 'value4' }
      ];

      const result = aggregateDataImmediate(dataArray);

      expect(result).toEqual({
        field1: ['value1', undefined],
        field2: ['value2', 'value3'],
        field3: [undefined, 'value4']
      });
    });
  });

  describe('flush behavior', () => {
    it('should flush data when timer expires', (done) => {
      aggregateData({ input: 'test1' }, (data) => {
        expect(data.input).toContain('test1');
        expect(data.input).toContain('test2');
        done();
      });

      aggregateData({ input: 'test2' });
      // Timer should trigger flush after 1000ms
    });

    it('should handle timer-based flush', (done) => {
      // Create aggregator with default flush interval (1000ms)
      aggregateData({ input: 'test' }, (data) => {
        expect(data).toEqual({ input: ['test'] });
        done();
      });
      // Timer should trigger flush after 1000ms
    });

    it('should handle flush with empty cache via timer', (done) => {
      // Create aggregator with default flush interval (1000ms)
      aggregateData({ input: 'test' }, (_data) => {
        // This should be called since we added data
        done();
      });

      // Timer should trigger flush after 1000ms
    });

    it('should handle multiple rapid calls', (done) => {
      let callCount = 0;

      const callback = (data: any) => {
        callCount++;
        if (callCount === 1) {
          // First flush should have all data
          expect(data.input).toHaveLength(1000);
          expect(data.input[0]).toBe('item-0');
          expect(data.input[999]).toBe('item-999');
          done();
        }
      };

      // Hammer the function 1000 times rapidly
      for (let i = 0; i < 1000; i++) {
        aggregateData({ input: `item-${i}` }, callback);
      }

      // Timer should trigger flush after 1000ms
    });
  });
});
