export { VoteFeedback } from '@/components/vote-feedback';
export type {
  FeedbackData,
  VoteFeedbackRootProps,
  UpvoteButtonProps,
  DownvoteButtonProps,
  PopoverProps,
  TextareaProps,
  SubmitButtonProps,
} from '@/types';

// Default handler and context
export { KeletProvider, KeletContext, useKelet, useDefaultFeedbackHandler } from '@/contexts/kelet';
