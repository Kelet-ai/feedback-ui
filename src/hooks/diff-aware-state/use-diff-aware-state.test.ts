import { describe, expect, it } from 'vitest';
import { calculateDiffPercentage, formatDiff } from './diff-utils';

// Simple tests for the diff utility functions
// Hook tests are comprehensive in Storybook with full React environment

describe('useDiffAwareState - Diff utilities', () => {
  it('should calculate string diff percentage correctly', () => {
    expect(calculateDiffPercentage('hello', 'hello')).toBe(0);
    expect(calculateDiffPercentage('hello', 'world')).toBeGreaterThan(0);
    expect(calculateDiffPercentage('hello', 'helloworld')).toBeGreaterThan(0);
  });

  it('should calculate number diff percentage correctly', () => {
    expect(calculateDiffPercentage(0, 0)).toBe(0);
    expect(calculateDiffPercentage(10, 20)).toBeGreaterThan(0);
    expect(calculateDiffPercentage(10, 11)).toBeLessThan(0.5);
  });

  it('should calculate object diff percentage correctly', () => {
    const obj1 = { name: 'John', age: 30 };
    const obj2 = { name: 'John', age: 31 };
    const obj3 = { name: 'Jane', age: 25 };

    expect(calculateDiffPercentage(obj1, obj1)).toBe(0);
    expect(calculateDiffPercentage(obj1, obj2)).toBeLessThan(0.5);
    expect(calculateDiffPercentage(obj1, obj3)).toBeGreaterThan(0);
  });

  it('should format diffs in different formats', () => {
    const old = { name: 'John' };
    const newObj = { name: 'Jane' };

    const gitDiff = formatDiff(old, newObj, 'git');
    const objectDiff = formatDiff(old, newObj, 'object');
    const jsonDiff = formatDiff(old, newObj, 'json');

    expect(typeof gitDiff).toBe('string');
    expect(typeof objectDiff).toBe('string');
    expect(typeof jsonDiff).toBe('string');

    expect(gitDiff).toContain('-');
    expect(gitDiff).toContain('+');
    expect(objectDiff).toContain('"kind"');
    expect(jsonDiff).toContain('"before"');
    expect(jsonDiff).toContain('"after"');
  });

  it('should handle edge cases', () => {
    expect(calculateDiffPercentage(null, null)).toBe(0);
    expect(calculateDiffPercentage(undefined, undefined)).toBe(0);
    expect(calculateDiffPercentage('', '')).toBe(0);
    expect(calculateDiffPercentage([], [])).toBe(0);
  });
});
