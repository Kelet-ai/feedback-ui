import * as React from 'react';
import type { VoteFeedbackRootProps } from '@kelet-ai/feedback-ui';
import { VoteFeedback } from '@kelet-ai/feedback-ui';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShadcnVoteFeedbackProps
  extends Omit<VoteFeedbackRootProps, 'children'> {
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  title?: string;
  description?: string;
  placeholder?: string;
  className?: string;
}

const ShadcnVoteFeedback = React.forwardRef<
  HTMLDivElement,
  ShadcnVoteFeedbackProps
>(
  (
    {
      children,
      variant = 'outline',
      size = 'sm',
      title = 'Feedback',
      description = 'Help us improve by sharing your thoughts.',
      placeholder = 'What could we do better?',
      className,
      ...props
    },
    ref
  ) => {
    let selectedVariant = variant;
    let selectedBg = '';
    switch (variant) {
      case 'outline':
        selectedBg = 'bg-secondary';
        break;
      case 'secondary':
        selectedVariant = 'default';
        break;
      case 'ghost':
        selectedBg = 'bg-secondary';
        break;
      case 'default':
        selectedVariant = 'secondary';
        break;
    }
    return (
      <div ref={ref} className={cn('flex items-center gap-1', className)}>
        <VoteFeedback.Root {...props}>
          {/* Upvote Button */}
          <VoteFeedback.UpvoteButton asChild>
            {({ isSelected }) => (
              <Button
                variant={isSelected ? selectedVariant : variant}
                size={size}
                className={`h-8 w-8 p-0 ${isSelected ? `${selectedBg}` : ''}`}
                data-selected={isSelected}
                aria-label="Helpful"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="sr-only">Helpful</span>
              </Button>
            )}
          </VoteFeedback.UpvoteButton>

          {/* Downvote Button with Popover */}
          <Popover>
            <VoteFeedback.DownvoteButton asChild>
              {({ isSelected }) => (
                <PopoverTrigger asChild>
                  <Button
                    variant={isSelected ? selectedVariant : variant}
                    size={size}
                    className={`h-8 w-8 p-0 ${isSelected ? `${selectedBg}` : ''}`}
                    data-selected={isSelected}
                    aria-label="Not helpful"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="sr-only">Not helpful</span>
                  </Button>
                </PopoverTrigger>
              )}
            </VoteFeedback.DownvoteButton>

            <VoteFeedback.Popover asChild>
              <PopoverContent className="w-80 p-4" side="bottom" align="start">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-medium leading-none">{title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>

                  <VoteFeedback.Textarea asChild>
                    <Textarea
                      placeholder={placeholder}
                      className="min-h-[80px] resize-none"
                    />
                  </VoteFeedback.Textarea>

                  <div className="flex justify-end gap-2">
                    <VoteFeedback.SubmitButton asChild>
                      <Button size="sm">Submit</Button>
                    </VoteFeedback.SubmitButton>
                  </div>
                </div>
              </PopoverContent>
            </VoteFeedback.Popover>
          </Popover>

          {children}
        </VoteFeedback.Root>
      </div>
    );
  }
);

ShadcnVoteFeedback.displayName = 'ShadcnVoteFeedback';

export { ShadcnVoteFeedback };
export type { ShadcnVoteFeedbackProps };
