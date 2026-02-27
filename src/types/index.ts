import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react"

/**
 * Captured DOM event information (automatically included in feedback metadata)
 */
export interface CapturedEvent {
  /** Event type (e.g., 'click', 'keydown') */
  type: string
  /** CSS selector path to the target element */
  targetSelector: string
  /** Text content or aria-label of the target element */
  targetText: string
  /** Timestamp when the event occurred (ms since epoch) */
  timestamp: number
  /** Mouse coordinates for click events */
  coordinates?: { x: number; y: number }
  /** Key pressed for keyboard events */
  key?: string
}

/**
 * Signal kind — what type of signal this is
 */
export type SignalKind = "feedback" | "edit"

/**
 * Feedback data structure returned by the component
 */
export interface FeedbackData {
  session_id: string
  kind: SignalKind
  source: "human"
  trigger_name?: string
  score?: number // 1 for upvote, 0 for downvote
  value?: string // text content: feedback text, diff, reasoning, etc.
  confidence?: number // diff_percentage for implicit edits (0.0-1.0)
  metadata?: Record<string, any>
  timestamp?: string // ISO 8601
  trace_id?: string // optional, if available
}

/**
 * Props for the root VoteFeedback component
 * This is a headless component - no styling included
 */
export interface VoteFeedbackRootProps {
  children: ReactNode
  onFeedback?: (data: FeedbackData) => void | Promise<void>
  defaultText?: string
  session_id: string | (() => string)
  metadata?: Record<string, any>
  trigger_name?: string // Trigger name for categorizing feedback (no default)
  trace_id?: string // Optional trace ID to attach to feedback
}

/**
 * Props for the upvote button
 * Headless - you provide your own styling and content
 */
export interface UpvoteButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  asChild?: boolean
  children: ReactNode | (({ isSelected }: { isSelected: boolean }) => ReactNode)
}

/**
 * Props for the downvote button
 * Headless - you provide your own styling and content
 */
export interface DownvoteButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  asChild?: boolean
  children: ReactNode | (({ isSelected }: { isSelected: boolean }) => ReactNode)
}

/**
 * Props for the popover container
 * Headless - you control the positioning and styling
 */
export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  children: ReactNode
}

/**
 * Props for the textarea input
 * Headless - you provide your own styling
 */
export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  asChild?: boolean
}

/**
 * Props for the submit button
 * Headless - you provide your own styling and content
 */
export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: ReactNode
}
