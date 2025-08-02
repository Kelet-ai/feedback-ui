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
export {
  KeletProvider,
  KeletContext,
  useKelet,
  useDefaultFeedbackHandler,
} from '@/contexts/kelet';

// Diff-aware state hook
export { useDiffAwareState } from '@/hooks/diff-aware-state';
export type { DiffOptions, DiffType } from '@/hooks/diff-aware-state';

// Note: src/lib/utils.ts is excluded from npm package (shadcn-specific)
// Note: src/ui/ is excluded from npm package (styled components available via shadcn registry)
