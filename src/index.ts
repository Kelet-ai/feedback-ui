export { VoteFeedback } from './components/vote-feedback';
export type {
  FeedbackData,
  VoteFeedbackRootProps,
  UpvoteButtonProps,
  DownvoteButtonProps,
  PopoverProps,
  TextareaProps,
  SubmitButtonProps,
} from './types';

// Default handler and context
export { createDefaultHandler, useDefaultHandler } from './handlers/default';
export { KeletProvider, KeletContext } from './contexts/kelet';

// Backward compatibility
export { VoteFeedback as ApprovalFeedback } from './components/vote-feedback';

// shadcn/ui styled components
export { ShadcnVoteFeedback } from './ui/shadcn';
export type { ShadcnVoteFeedbackProps } from './ui/shadcn';
