import type { Dispatch, SetStateAction } from 'react';
import type { DiffType } from './diff-utils';
import type { FeedbackData } from '@/types';

/**
 * Options for the useDiffAwareState hook
 */
export interface DiffOptions<T> {
  /**
   * Time to wait before sending feedback after state changes (ms)
   * @default 1500
   */
  debounceMs?: number;

  /**
   * Format for the diff output in the correction field
   * @default 'git'
   */
  diffType?: DiffType;

  /**
   * Optional custom equality comparison function
   */
  compareWith?: (a: T, b: T) => boolean;

  /**
   * Additional metadata to send with the feedback
   */
  metadata?: Record<string, any>;

  /**
   * Optional custom feedback handler for testing
   */
  onFeedback?: FeedbackHandler;

  /**
   * Vote classification - static vote or function to determine vote based on changes
   * @default Automatic determination based on diff percentage (>50% = downvote, ≤50% = upvote)
   */
  vote?:
    | 'upvote'
    | 'downvote'
    | ((before: T, after: T, diffPercentage: number) => 'upvote' | 'downvote');
}

/**
 * Return type of the useDiffAwareState hook - matches useState hook
 */
export type DiffAwareStateReturn<T> = [T, Dispatch<SetStateAction<T>>];

/**
 * Function to handle feedback submission
 */
export type FeedbackHandler = (data: FeedbackData) => Promise<void>;
