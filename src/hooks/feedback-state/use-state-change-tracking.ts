import { useCallback, useEffect, useRef } from 'react';
import { useDefaultFeedbackHandler } from '@/contexts/kelet';
import { calculateDiffPercentage, formatDiff } from './diff-utils';
import type { FeedbackStateOptions } from './types';

/**
 * Internal utility hook that handles state change tracking and feedback sending.
 * This contains all the shared logic between useFeedbackState and useFeedbackReducer.
 *
 * @param currentState The current state to track changes for
 * @param tx_id A unique transaction ID for the state (string or function that derives from state)
 * @param options Optional configuration options
 * @returns Object with notifyChange function to notify of impending state changes
 */
export function useStateChangeTracking<T>(
  currentState: T,
  tx_id: string | ((state: T) => string),
  options?: FeedbackStateOptions<T>
) {
  // Get the feedback handler (custom or default from Kelet context)
  const defaultFeedbackHandler = useDefaultFeedbackHandler();
  const feedbackHandler = options?.onFeedback || defaultFeedbackHandler;

  // Determine defaults from options
  const debounceMs = options?.debounceMs ?? 1500;
  const diffType = options?.diffType ?? 'git';
  const compareWith = options?.compareWith;
  const defaultTriggerName =
    options?.default_trigger_name ?? 'auto_state_change';
  const ignoreInitialNullish = options?.ignoreInitialNullish ?? true;

  // Keep track of previous state for comparison
  const prevStateRef = useRef<T>(currentState);

  // Track the state when changes started (for debouncing)
  const changeStartStateRef = useRef<T>(currentState);

  // Track if this is the first render
  const isFirstRenderRef = useRef<boolean>(true);

  // Track the initial state to detect nullish→value transitions
  const initialStateRef = useRef<T>(currentState);

  // Track if we've had any non-nullish state yet
  const hasHadNonNullishStateRef = useRef<boolean>(
    currentState != null // != null catches both null and undefined
  );

  // Store timeout ID for debounce cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store the trigger name for the current change sequence
  const currentTriggerNameRef = useRef<string | undefined>(undefined);

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

      const idString = typeof tx_id === 'function' ? tx_id(endState) : tx_id;

      feedbackHandler({
        tx_id: idString,
        vote,
        explanation: `State change with diff percentage: ${(diffPercentage * 100).toFixed(1)}%`,
        correction: diffString,
        source: 'IMPLICIT',
        extra_metadata: options?.metadata,
        trigger_name: triggerName,
      });
    },
    [options, tx_id, diffType, feedbackHandler]
  );

  // Function to notify of impending state changes with trigger name support
  const notifyChange = useCallback(
    (trigger_name?: string) => {
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
        const currentStateBeforeChange = currentState; // Current state before this new change

        sendFeedback(
          startState,
          currentStateBeforeChange,
          currentTriggerNameRef.current
        );

        // Reset for the new trigger sequence
        timeoutRef.current = null;
      }

      // Store the new trigger name for this change
      currentTriggerNameRef.current = newTriggerName;
    },
    [currentState, defaultTriggerName, sendFeedback]
  );

  // Effect to compare state changes and send feedback
  useEffect(() => {
    // Skip the initial render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevStateRef.current = currentState;
      changeStartStateRef.current = currentState;
      return;
    }

    // Check if state actually changed
    const prevState = prevStateRef.current;
    const isEqual = compareWith
      ? compareWith(prevState, currentState)
      : JSON.stringify(prevState) === JSON.stringify(currentState);

    if (!isEqual) {
      // Check if we should ignore this change due to initial nullish transition
      const shouldIgnoreChange =
        ignoreInitialNullish &&
        initialStateRef.current == null && // Initial state was nullish
        !hasHadNonNullishStateRef.current && // We haven't had non-nullish state before
        currentState != null; // Current state is non-nullish

      // Update hasHadNonNullishStateRef if current state is non-nullish
      if (currentState != null) {
        hasHadNonNullishStateRef.current = true;
      }

      if (shouldIgnoreChange) {
        // Update refs but don't send feedback for this transition
        prevStateRef.current = currentState;
        changeStartStateRef.current = currentState;
        return;
      }

      // If no timer is running, this is the start of a change sequence
      if (!timeoutRef.current) {
        changeStartStateRef.current = prevState;
      }

      // Clear previous timeout if it exists (extends the debounce timer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update the current state reference immediately
      prevStateRef.current = currentState;

      // Set new timeout to debounce feedback
      timeoutRef.current = setTimeout(() => {
        // Compare from when changes started to final state
        const startState = changeStartStateRef.current;
        const finalState = currentState;

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
    currentState,
    tx_id,
    options,
    feedbackHandler,
    diffType,
    debounceMs,
    compareWith,
    defaultTriggerName,
    ignoreInitialNullish,
    sendFeedback,
  ]);

  return {
    notifyChange,
  };
}
