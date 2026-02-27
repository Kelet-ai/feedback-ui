import type { SetStateAction } from "react"
import type { DiffType } from "@/hooks"
import type { FeedbackData } from "@/types"

/**
 * Options for the useFeedbackState and useFeedbackReducer hooks
 */
export interface FeedbackStateOptions<T> {
  /**
   * Time to wait before sending feedback after state changes (ms)
   * @default 3000
   */
  debounceMs?: number

  /**
   * Format for the diff output in the value field
   * @default 'git'
   */
  diffType?: DiffType

  /**
   * Optional custom equality comparison function
   */
  compareWith?: (a: T, b: T) => boolean

  /**
   * Additional metadata to send with the feedback
   */
  metadata?: Record<string, any>

  /**
   * Optional custom feedback handler for testing
   */
  onFeedback?: FeedbackHandler

  /**
   * Score classification - static score or function to determine score based on changes
   * @default Automatic determination based on diff percentage (>50% = 0, ≤50% = 1)
   */
  score?:
    | number
    | ((before: T, after: T, diffPercentage: number) => number)

  /**
   * Default trigger name for state changes when no trigger is specified in setState/dispatch
   * @default 'auto_state_change'
   */
  default_trigger_name?: string

  /**
   * Whether to ignore transitions from initial null/undefined values to prevent noise
   * from common loading patterns where initial state is null/undefined and then set via XHR
   * @default true
   */
  ignoreInitialNullish?: boolean
}

/**
 * Custom setState function that accepts an optional trigger_name parameter
 */
export type FeedbackStateSetter<T> = (
  value: SetStateAction<T>,
  trigger_name?: string
) => void

/**
 * Return type of the useFeedbackState hook - enhanced setState with trigger_name support
 */
export type FeedbackStateReturn<T> = [T, FeedbackStateSetter<T>]

/**
 * Custom dispatch function that accepts an optional trigger_name parameter
 */
export type FeedbackDispatch<A> = (action: A, trigger_name?: string) => void

/**
 * Return type of the useFeedbackReducer hook - same as React's useReducer but with enhanced dispatch
 */
export type FeedbackReducerReturn<S, A> = [S, FeedbackDispatch<A>]

/**
 * Function to handle feedback submission
 */
export type FeedbackHandler = (data: FeedbackData) => Promise<void>
