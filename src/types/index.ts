import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';

/**
 * Feedback data structure returned by the component
 */
export interface FeedbackData {
  tx_id: string;
  extra_metadata?: Record<string, any>;
  vote: 'upvote' | 'downvote';
  explanation?: string;
  source?: 'IMPLICIT' | 'EXPLICIT'; // Default is 'EXPLICIT'
  correction?: string; // Used for diff data
  selection?: string; // Optional selected text
  trigger_name?: string; // Optional trigger name for categorizing feedback
}

/**
 * Props for the root VoteFeedback component
 * This is a headless component - no styling included
 */
export interface VoteFeedbackRootProps {
  children: ReactNode;
  onFeedback?: (data: FeedbackData) => void | Promise<void>;
  defaultText?: string;
  tx_id: string | (() => string);
  extra_metadata?: Record<string, any>;
  trigger_name?: string; // Optional trigger name for categorizing feedback
}

/**
 * Props for the upvote button
 * Headless - you provide your own styling and content
 */
export interface UpvoteButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  asChild?: boolean;
  children:
    | ReactNode
    | (({ isSelected }: { isSelected: boolean }) => ReactNode);
}

/**
 * Props for the downvote button
 * Headless - you provide your own styling and content
 */
export interface DownvoteButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  asChild?: boolean;
  children:
    | ReactNode
    | (({ isSelected }: { isSelected: boolean }) => ReactNode);
}

/**
 * Props for the popover container
 * Headless - you control the positioning and styling
 */
export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: ReactNode;
}

/**
 * Props for the textarea input
 * Headless - you provide your own styling
 */
export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  asChild?: boolean;
}

/**
 * Props for the submit button
 * Headless - you provide your own styling and content
 */
export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}
