import { useCallback, useReducer } from "react"

import type {
  FeedbackDispatch,
  FeedbackReducerReturn,
  FeedbackStateOptions,
} from "./types"
import { useStateChangeTracking } from "./use-state-change-tracking"

/**
 * A drop-in replacement for React's useReducer that tracks changes to state over time
 * and automatically sends these changes as implicit feedback through the Kelet system.
 *
 * @param reducer The reducer function - same as React's useReducer
 * @param initialState The initial state value
 * @param session_id A unique session ID for the state (string or function that derives from state)
 * @param options Optional configuration options
 * @param initializer Optional initializer function - same as React's useReducer
 * @returns A tuple of [state, dispatch] just like React's useReducer
 *
 * @example
 * // Basic usage with required session_id
 * const [state, dispatch] = useFeedbackReducer(reducer, initialState, 'counter');
 *
 * // Using with options and dynamic session_id
 * const [items, dispatch] = useFeedbackReducer(
 *   itemsReducer,
 *   [],
 *   (items) => `items-${items.length}`,
 *   {
 *     debounceMs: 1000,
 *     diffType: 'object'
 *   }
 * );
 *
 * // Dispatch with automatic trigger name extraction from action.type
 * dispatch({ type: 'ADD_ITEM', payload: 'new item' });
 *
 * // Dispatch with explicit trigger name
 * dispatch({ type: 'ADD_ITEM', payload: 'new item' }, 'user_action');
 */
export function useFeedbackReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  session_id: string | ((state: S) => string),
  options?: FeedbackStateOptions<S>,
  initializer?: (arg: S) => S
): FeedbackReducerReturn<S, A> {
  // Use React's native useReducer for state management
  const [state, dispatchInternal] = useReducer(
    reducer,
    initialState,
    initializer as any
  )

  // Use the shared state change tracking logic
  const { notifyChange } = useStateChangeTracking(state, session_id, options)

  // Wrap dispatch to track changes with trigger_name support
  const dispatch: FeedbackDispatch<A> = useCallback(
    (action, trigger_name) => {
      // Determine the effective trigger name:
      // 1. Explicitly provided trigger_name takes precedence
      // 2. Try to extract from action.type if action is an object with type property
      // 3. Fall back to default trigger name from options or 'auto_state_change'
      const effectiveTrigger =
        trigger_name ||
        (action && typeof action === "object" && "type" in action
          ? (action as any).type
          : options?.default_trigger_name || "auto_state_change")

      // Notify about the impending state change with trigger name
      notifyChange(effectiveTrigger)

      // Dispatch the action using React's native dispatch
      dispatchInternal(action)
    },
    [notifyChange, options?.default_trigger_name, dispatchInternal]
  )

  return [state, dispatch]
}
