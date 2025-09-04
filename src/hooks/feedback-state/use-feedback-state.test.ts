import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { calculateDiffPercentage, formatDiff } from './diff-utils';
import { useFeedbackState } from '@/hooks';

// Simple tests for the diff utility functions
// Hook tests are comprehensive in Storybook with full React environment

describe('useFeedbackState - Diff utilities', () => {
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

// Tests for trigger_name functionality
describe('useFeedbackState - trigger_name functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('uses default trigger_name when no default_trigger_name is specified', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('initial', 'test-id', {
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    act(() => {
      result.current[1]('changed');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_name: 'auto_state_change',
        tx_id: 'test-id',
      })
    );
  });

  it('uses custom default_trigger_name', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('initial', 'test-id', {
        default_trigger_name: 'content_editing',
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    act(() => {
      result.current[1]('changed');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_name: 'content_editing',
      })
    );
  });

  it('overrides default with setState trigger_name parameter', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('initial', 'test-id', {
        default_trigger_name: 'default_trigger',
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    act(() => {
      result.current[1]('changed', 'ai_assistance');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_name: 'ai_assistance',
      })
    );
  });

  it('immediately flushes previous sequence when trigger changes', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('initial', 'test-id', {
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    // Start first sequence
    act(() => {
      result.current[1]('edit1', 'content_edit');
      result.current[1]('edit2', 'content_edit');
    });

    expect(mockHandler).not.toHaveBeenCalled();

    // Switch trigger - should immediately flush
    act(() => {
      result.current[1]('ai_edit', 'ai_assistance');
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_name: 'content_edit',
      })
    );

    // Complete second sequence
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockHandler).toHaveBeenCalledTimes(2);
    expect(mockHandler).toHaveBeenLastCalledWith(
      expect.objectContaining({
        trigger_name: 'ai_assistance',
      })
    );
  });

  it('same trigger extends debounce without flushing', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('initial', 'test-id', {
        debounceMs: 500,
        onFeedback: mockHandler,
      })
    );

    act(() => {
      result.current[1]('change1', 'content_edit');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current[1]('change2', 'content_edit'); // Same trigger
    });

    expect(mockHandler).not.toHaveBeenCalled(); // Still debouncing

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_name: 'content_edit',
      })
    );
  });

  it('handles rapid trigger switching correctly', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('start', 'test-id', {
        debounceMs: 200,
        onFeedback: mockHandler,
      })
    );

    // First call - should start debounce timer for trigger1
    act(() => {
      result.current[1]('a', 'trigger1');
    });

    expect(mockHandler).toHaveBeenCalledTimes(0); // No flush yet

    // Second call with different trigger - should flush trigger1
    act(() => {
      result.current[1]('b', 'trigger2');
    });

    expect(mockHandler).toHaveBeenCalledTimes(1); // Should flush trigger1

    // Third call with different trigger - should flush trigger2
    act(() => {
      result.current[1]('c', 'trigger3');
    });

    expect(mockHandler).toHaveBeenCalledTimes(2); // Should flush trigger2

    // Fourth call with same trigger - should continue debouncing
    act(() => {
      result.current[1]('d', 'trigger3');
    });

    expect(mockHandler).toHaveBeenCalledTimes(2); // Still just 2 flushes

    // Complete the final sequence
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockHandler).toHaveBeenCalledTimes(3); // Now 3 total

    // Check the trigger names in order
    expect(mockHandler.mock.calls[0]?.[0]?.trigger_name).toBe('trigger1');
    expect(mockHandler.mock.calls[1]?.[0]?.trigger_name).toBe('trigger2');
    expect(mockHandler.mock.calls[2]?.[0]?.trigger_name).toBe('trigger3');
  });

  it('state updates work correctly with trigger switching', () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('initial', 'test-id', {
        debounceMs: 500,
        onFeedback: mockHandler,
      })
    );

    // State should update immediately regardless of trigger switching
    act(() => {
      result.current[1]('change1', 'trigger1');
    });
    expect(result.current[0]).toBe('change1');

    act(() => {
      result.current[1]('change2', 'trigger2');
    });
    expect(result.current[0]).toBe('change2');

    act(() => {
      result.current[1]('change3', 'trigger2');
    });
    expect(result.current[0]).toBe('change3');
  });

  it('works with functional state updates and trigger names', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState(0, 'counter', {
        debounceMs: 500,
        onFeedback: mockHandler,
      })
    );

    // First increment - starts debouncing
    act(() => {
      result.current[1](prev => prev + 1, 'increment');
    });
    expect(result.current[0]).toBe(1);
    expect(mockHandler).toHaveBeenCalledTimes(0);

    // Second increment - extends debouncing (same trigger)
    act(() => {
      result.current[1](prev => prev + 1, 'increment');
    });
    expect(result.current[0]).toBe(2);
    expect(mockHandler).toHaveBeenCalledTimes(0);

    // Multiply - different trigger, should flush increment sequence
    act(() => {
      result.current[1](prev => prev * 2, 'multiply');
    });
    expect(result.current[0]).toBe(4); // (0+1+1)*2 = 4
    expect(mockHandler).toHaveBeenCalledTimes(1); // Should flush increment
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_name: 'increment',
      })
    );
  });
});

// Tests for ignoreInitialNullish functionality
describe('useFeedbackState - ignoreInitialNullish functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('ignores null to value transition by default', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState(null, 'api-data-tx', {
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    // Simulate XHR loading pattern: null -> data
    act(() => {
      result.current[1]({ id: 1, name: 'John' } as any);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should NOT send feedback for null -> data transition
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('ignores undefined to value transition by default', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState(undefined, 'api-data-tx', {
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    // Simulate loading pattern: undefined -> data
    act(() => {
      result.current[1]({ id: 1, name: 'John' } as any);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should NOT send feedback for undefined -> data transition
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('tracks subsequent changes after initial nullish transition', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState(null, 'api-data-tx', {
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    // First transition: null -> data (should be ignored)
    act(() => {
      result.current[1]({ id: 1, name: 'John' } as any);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockHandler).not.toHaveBeenCalled();

    // Second transition: data -> updated data (should be tracked)
    act(() => {
      result.current[1]({ id: 1, name: 'Jane' } as any);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should send feedback for data -> updated data transition
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        tx_id: 'api-data-tx',
        trigger_name: 'auto_state_change',
      })
    );
  });

  it('can be disabled with ignoreInitialNullish: false', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState(null, 'api-data-tx', {
        debounceMs: 1000,
        onFeedback: mockHandler,
        ignoreInitialNullish: false,
      })
    );

    // Transition: null -> data (should be tracked when disabled)
    act(() => {
      result.current[1]({ id: 1, name: 'John' } as any);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should send feedback when ignoreInitialNullish is disabled
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        tx_id: 'api-data-tx',
        trigger_name: 'auto_state_change',
      })
    );
  });

  it('works with non-nullish initial values', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('initial', 'string-tx', {
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    // Change from non-nullish to non-nullish (should always be tracked)
    act(() => {
      result.current[1]('changed');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should send feedback for non-nullish initial values
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('handles complex objects with null initial state', async () => {
    const mockHandler = vi.fn();
    interface UserState {
      user: { id: number; name: string } | null;
      loading: boolean;
    }

    const { result } = renderHook(() =>
      useFeedbackState<UserState>(
        { user: null, loading: true },
        'user-loading-tx',
        {
          debounceMs: 1000,
          onFeedback: mockHandler,
        }
      )
    );

    // Simulate loading completion
    act(() => {
      result.current[1]({
        user: { id: 1, name: 'John' },
        loading: false,
      });
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should track changes in complex objects even when they contain null fields
    // because the initial state is not nullish (it's an object)
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('ignores only first transition from nullish, not subsequent nullish transitions', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState(null, 'api-data-tx', {
        debounceMs: 1000,
        onFeedback: mockHandler,
      })
    );

    // First transition: null -> data (ignored)
    act(() => {
      result.current[1]({ id: 1, name: 'John' } as any);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockHandler).not.toHaveBeenCalled();

    // Second transition: data -> null (should be tracked)
    act(() => {
      result.current[1](null);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);

    // Third transition: null -> data again (should be tracked now)
    act(() => {
      result.current[1]({ id: 2, name: 'Jane' } as any);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockHandler).toHaveBeenCalledTimes(2);
  });
});

// Tests for baseline diffing semantics
describe('useFeedbackState - baseline diffing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('diffs are computed against the initial baseline (non-nullish)', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState('a', 'baseline-tx', {
        debounceMs: 200,
        diffType: 'json',
        onFeedback: mockHandler,
      })
    );

    // Make two rapid changes within debounce window
    act(() => {
      result.current[1]('ab');
      result.current[1]('abc');
    });

    // Flush debounce
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    const call = mockHandler.mock.calls[0]?.[0];
    const correction = JSON.parse(call.correction);
    expect(correction.before).toBe('a');
    expect(correction.after).toBe('abc');
  });

  it('when initial is nullish and ignored, baseline becomes first non-nullish value', async () => {
    const mockHandler = vi.fn();
    const { result } = renderHook(() =>
      useFeedbackState<string | null>(null, 'baseline-nullish', {
        debounceMs: 200,
        diffType: 'json',
        onFeedback: mockHandler,
        ignoreInitialNullish: true,
      })
    );

    // First transition: null -> 'first' (should be ignored and set baseline)
    act(() => {
      result.current[1]('first');
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(mockHandler).toHaveBeenCalledTimes(0);

    // Second transition: 'first' -> 'second' (should be reported, baseline = 'first')
    act(() => {
      result.current[1]('second');
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    const call = mockHandler.mock.calls[0]?.[0];
    const correction = JSON.parse(call.correction);
    expect(correction.before).toBe('first');
    expect(correction.after).toBe('second');
  });
});
