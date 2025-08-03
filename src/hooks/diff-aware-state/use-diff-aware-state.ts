import { useCallback, useEffect, useRef, useState } from 'react';
import { useDefaultFeedbackHandler } from '@/contexts/kelet';
import { calculateDiffPercentage, formatDiff } from './diff-utils';
import type { DiffAwareStateReturn, DiffOptions } from './types';

/**
 * A drop-in replacement for React's useState that tracks changes to state over time
 * and automatically sends these changes as implicit feedback through the Kelet system.
 *
 * @param initialState The initial state value
 * @param identifier A unique identifier for the state (string or function that derives from state)
 * @param options Optional configuration options
 * @returns A tuple of [state, setState] just like React's useState
 *
 * @example
 * // Basic usage with required identifier
 * const [count, setCount] = useDiffAwareState(0, 'counter');
 *
 * // Using with static identifier and options
 * const [preferences, setPreferences] = useDiffAwareState(
 *   {theme: 'light', notifications: true},
 *   'user-preferences',
 *   {
 *     debounceMs: 1000,
 *     diffType: 'object'
 *   }
 * );
 *
 * // With dynamic identifier derived from state
 * const [items, setItems] = useDiffAwareState(
 *   [1, 2, 3],
 *   (items) => `items-${items.length}`
 * );
 */
export function useDiffAwareState<T>(
  initialState: T,
  identifier: string | ((state: T) => string),
  options?: DiffOptions<T>
): DiffAwareStateReturn<T> {
  // Initialize state with React's useState
  const [state, setStateInternal] = useState<T>(initialState);

  // Keep track of previous state for comparison
  const prevStateRef = useRef<T>(initialState);

  // Track the state when changes started (for debouncing)
  const changeStartStateRef = useRef<T>(initialState);

  // Track if this is the first render
  const isFirstRenderRef = useRef<boolean>(true);

  // Store timeout ID for debounce cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store the trigger name for the current change sequence
  const currentTriggerNameRef = useRef<string | undefined>(undefined);

  // Get the feedback handler (custom or default from Kelet context)
  const defaultFeedbackHandler = useDefaultFeedbackHandler();
  const feedbackHandler = options?.onFeedback || defaultFeedbackHandler;

  // Determine defaults from options
  const debounceMs = options?.debounceMs ?? 1500;
  const diffType = options?.diffType ?? 'git';
  const compareWith = options?.compareWith;
  const defaultTriggerName =
    options?.default_trigger_name ?? 'auto_state_change';

  // Helper function to send feedback
  const sendFeedback = useCallback(
    (startState: T, endState: T, triggerName: string) => {
      const diffPercentage = calculateDiffPercentage(startState, endState);
      const diffString = formatDiff(startState, endState, diffType);

      let vote: 'upvote' | 'downvote';
      if (options?.vote) {
        if (typeof options.vote === 'function') {
          vote = options.vote(startState, endState, diffPercentage);
        } else {
          vote = options.vote;
        }
      } else {
        vote = diffPercentage > 0.5 ? 'downvote' : 'upvote';
      }

      const idString =
        typeof identifier === 'function' ? identifier(endState) : identifier;

      feedbackHandler({
        identifier: idString,
        vote,
        explanation: `State change with diff percentage: ${(diffPercentage * 100).toFixed(1)}%`,
        correction: diffString,
        source: 'IMPLICIT',
        extra_metadata: options?.metadata,
        trigger_name: triggerName,
      });
    },
    [options, identifier, diffType, feedbackHandler]
  );

  // Wrap setState to track changes with trigger_name support
  const setState: DiffAwareStateReturn<T>[1] = (value, trigger_name) => {
    const newTriggerName = trigger_name || defaultTriggerName;

    // If trigger name changed and we have a running timer, immediately flush the previous sequence
    if (
      timeoutRef.current &&
      currentTriggerNameRef.current &&
      currentTriggerNameRef.current !== newTriggerName
    ) {
      // Clear the existing timeout
      clearTimeout(timeoutRef.current);

      // Immediately send feedback for the previous trigger sequence
      const startState = changeStartStateRef.current;
      const currentState = state; // Current state before this new change

      sendFeedback(startState, currentState, currentTriggerNameRef.current);

      // Reset for the new trigger sequence
      timeoutRef.current = null;
    }

    // Store the new trigger name for this change
    currentTriggerNameRef.current = newTriggerName;
    setStateInternal(prevState => {
      // Handle functional updates
      const newState =
        typeof value === 'function'
          ? (value as (prevState: T) => T)(prevState)
          : value;

      // Store new state for later comparison in useEffect
      return newState;
    });
  };

  // Effect to compare state changes and send feedback
  useEffect(() => {
    // Skip the initial render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevStateRef.current = state;
      changeStartStateRef.current = state;
      return;
    }

    // Check if state actually changed
    const prevState = prevStateRef.current;
    const isEqual = compareWith
      ? compareWith(prevState, state)
      : JSON.stringify(prevState) === JSON.stringify(state);

    if (!isEqual) {
      // If no timer is running, this is the start of a change sequence
      if (!timeoutRef.current) {
        changeStartStateRef.current = prevState;
      }

      // Clear previous timeout if it exists (extends the debounce timer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update the current state reference immediately
      prevStateRef.current = state;

      // Set new timeout to debounce feedback
      timeoutRef.current = setTimeout(() => {
        // Compare from when changes started to final state
        const startState = changeStartStateRef.current;
        const finalState = state;

        // Send feedback using the helper
        sendFeedback(
          startState,
          finalState,
          currentTriggerNameRef.current || defaultTriggerName
        );

        // Reset for next change sequence
        changeStartStateRef.current = finalState;
        timeoutRef.current = null;
      }, debounceMs);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    state,
    identifier,
    options,
    initialState,
    feedbackHandler,
    diffType,
    debounceMs,
    compareWith,
    defaultTriggerName,
    sendFeedback,
  ]);

  return [state, setState];
}
