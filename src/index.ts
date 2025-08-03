export { VoteFeedback } from '@/components';
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
export {
  KeletProvider,
  KeletContext,
  useKelet,
  useDefaultFeedbackHandler,
} from '@/contexts/kelet';

// Feedback state hook
export { useFeedbackState } from '@/hooks/feedback-state';
export type { FeedbackStateOptions, DiffType } from '@/hooks/feedback-state';

// Note: src/lib/utils.ts is excluded from npm package (shadcn-specific)
// Note: src/ui/ is excluded from npm package (styled components available via shadcn registry)
