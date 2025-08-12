import { useCallback, useState } from 'react';
import { useStateChangeTracking } from './use-state-change-tracking';
import type { FeedbackStateReturn, FeedbackStateOptions } from './types';

/**
 * A drop-in replacement for React's useState that tracks changes to state over time
 * and automatically sends these changes as implicit feedback through the Kelet system.
 *
 * @param initialState The initial state value
 * @param tx_id A unique transaction ID for the state (string or function that derives from state)
 * @param options Optional configuration options
 * @returns A tuple of [state, setState] just like React's useState
 *
 * @example
 * // Basic usage with required tx_id
 * const [count, setCount] = useFeedbackState(0, 'counter');
 *
 * // Using with static tx_id and options
 * const [preferences, setPreferences] = useFeedbackState(
 *   {theme: 'light', notifications: true},
 *   'user-preferences',
 *   {
 *     debounceMs: 1000,
 *     diffType: 'object'
 *   }
 * );
 *
 * // With dynamic tx_id derived from state
 * const [items, setItems] = useFeedbackState(
 *   [1, 2, 3],
 *   (items) => `items-${items.length}`
 * );
 */
export function useFeedbackState<T>(
  initialState: T,
  tx_id: string | ((state: T) => string),
  options?: FeedbackStateOptions<T>
): FeedbackStateReturn<T> {
  // Use React's native useState for state management
  const [state, setStateInternal] = useState<T>(initialState);

  // Use the shared state change tracking logic
  const { notifyChange } = useStateChangeTracking(state, tx_id, options);

  // Wrap setState to track changes with trigger_name support
  const setState: FeedbackStateReturn<T>[1] = useCallback(
    (value, trigger_name) => {
      // Notify about the impending state change with trigger name
      notifyChange(trigger_name);

      // Update state using React's native setState
      setStateInternal(prevState => {
        // Handle functional updates
        const newState =
          typeof value === 'function'
            ? (value as (prevState: T) => T)(prevState)
            : value;

        return newState;
      });
    },
    [notifyChange]
  );

  return [state, setState];
}
