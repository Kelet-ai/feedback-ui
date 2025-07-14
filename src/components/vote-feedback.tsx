import {cloneElement, createContext, isValidElement, useCallback, useContext, useId, useRef, useState,} from 'react';
import type {
  DownvoteButtonProps,
  FeedbackData,
  PopoverProps,
  SubmitButtonProps,
  TextareaProps,
  UpvoteButtonProps,
  VoteFeedbackRootProps,
} from '@/types';

// Utility function to merge props with a child element (asChild pattern)
const mergeProps = (slotProps: Record<string, any>, childProps: Record<string, any>) => {
  const overrideProps = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: any[]) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === 'style') {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ');
    } else {
      overrideProps[propName] = childPropValue !== undefined ? childPropValue : slotPropValue;
    }
  }

  return { ...slotProps, ...overrideProps };
};

// Context for the VoteFeedback component
interface VoteFeedbackContextValue {
  onFeedback?: (data: FeedbackData) => void | Promise<void>;
  showPopover: boolean;
  setShowPopover: (show: boolean) => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  vote: 'upvote' | 'downvote' | null;
  handleUpvote: () => void;
  handleDownvote: () => void;
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  popoverId: string;
  triggerId: string;
  identifier: string;
  extra_metadata?: Record<string, any>;
}

const VoteFeedbackContext = createContext<VoteFeedbackContextValue | null>(
  null
);

const useVoteFeedbackContext = () => {
  const context = useContext(VoteFeedbackContext);
  if (!context) {
    throw new Error(
      'VoteFeedback components must be used within VoteFeedback.Root'
    );
  }
  return context;
};

// Root component that provides context
const VoteFeedbackRoot = ({
  children,
  onFeedback,
  defaultText = '',
  identifier,
  extra_metadata,
}: VoteFeedbackRootProps) => {
  const [showPopover, setShowPopover] = useState(false);
  const [feedbackText, setFeedbackText] = useState(defaultText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vote, setVote] = useState<'upvote' | 'downvote' | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const popoverId = useId();
  const triggerId = useId();

  const handleUpvote = useCallback(async () => {
    setVote('upvote');
    if (onFeedback) {
      const data: FeedbackData = {
        identifier,
        type: 'upvote',
        ...(extra_metadata && { extra_metadata }),
      };

      try {
        setIsSubmitting(true);
        await onFeedback(data);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [onFeedback, identifier, extra_metadata]);

  const handleDownvote = useCallback(async () => {
    setVote('downvote');
    // First: Send feedback immediately (without explanation)
    if (onFeedback) {
      const data: FeedbackData = {
        identifier,
        type: 'downvote',
        ...(extra_metadata && { extra_metadata }),
      };

      try {
        setIsSubmitting(true);
        await onFeedback(data);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Second: Show popover for detailed feedback
    setShowPopover(true);
    // Auto-focus textarea when popover opens and announce to screen readers
    setTimeout(() => {
      textareaRef.current?.focus();
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent =
        'Feedback dialog opened. You can provide additional details about your downvote.';
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }, 0);
  }, [onFeedback, identifier, extra_metadata]);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFeedbackText(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    const hasText = feedbackText.trim().length > 0;

    if (hasText && onFeedback) {
      // Submit with explanation
      const data: FeedbackData = {
        identifier,
        type: 'downvote',
        explanation: feedbackText,
        ...(extra_metadata && { extra_metadata }),
      };

      try {
        setIsSubmitting(true);
        await onFeedback(data);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Always close popover and reset, whether text was provided or not
    setShowPopover(false);
    setFeedbackText(defaultText);
    // Return focus to trigger button and announce to screen readers
    triggerRef.current?.focus();

    // Announce completion to screen readers
    if (hasText) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = 'Feedback submitted successfully.';
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  }, [onFeedback, feedbackText, defaultText, identifier, extra_metadata]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPopover(false);
        setFeedbackText(defaultText);
        triggerRef.current?.focus();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Tab' && showPopover) {
        // Basic focus trapping - keep focus within popover
        const popoverElement = document.getElementById(popoverId);
        if (popoverElement) {
          const focusableElements = popoverElement.querySelectorAll(
            'button, textarea, input, select, a[href], [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [handleSubmit, showPopover, popoverId, defaultText]
  );

  const contextValue: VoteFeedbackContextValue = {
    onFeedback,
    showPopover,
    setShowPopover,
    feedbackText,
    setFeedbackText,
    isSubmitting,
    setIsSubmitting,
    vote,
    handleUpvote,
    handleDownvote,
    handleTextareaChange,
    handleSubmit,
    handleKeyDown,
    textareaRef,
    triggerRef,
    popoverId,
    triggerId,
    identifier,
    extra_metadata,
  };

  return (
    <VoteFeedbackContext.Provider value={contextValue}>
      {children}
    </VoteFeedbackContext.Provider>
  );
};

// Upvote button component
const UpvoteButton = ({
  asChild,
  children,
  onClick,
  ...props
}: UpvoteButtonProps) => {
  const { handleUpvote, isSubmitting, vote } = useVoteFeedbackContext();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleUpvote();
      onClick?.(e);
    },
    [handleUpvote, onClick]
  );

  const slotProps = {
    ...props,
    onClick: handleClick,
    disabled: isSubmitting || props.disabled,
    'aria-label': props['aria-label'] || 'Upvote feedback',
    type: 'button' as const,

  };

  const isSelected = vote === 'upvote';

  if (asChild) {
    const child = typeof children === 'function' ? children({ isSelected }) : children;
    if (isValidElement(child)) {
      return cloneElement(child, mergeProps(slotProps, child.props as Record<string, any>));
    }
  }

  return (
    <button {...slotProps}>
      {typeof children === 'function' ? children({ isSelected }) : children}
    </button>
  );
};

// Downvote button component
const DownvoteButton = ({
  asChild,
  children,
  onClick,
  ...props
}: DownvoteButtonProps) => {
  const {
    handleDownvote,
    showPopover,
    isSubmitting,
    popoverId,
    triggerId,
    triggerRef,
    vote,
  } = useVoteFeedbackContext();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleDownvote();
      onClick?.(e);
    },
    [handleDownvote, onClick]
  );

  const slotProps = {
    ...props,
    ref: triggerRef,
    onClick: handleClick,
    disabled: isSubmitting || props.disabled,
    'aria-label': props['aria-label'] || 'Downvote feedback',
    'aria-expanded': showPopover,
    'aria-controls': popoverId,
    id: triggerId,
    type: 'button' as const,
  };

  const isSelected = vote === 'downvote';

  if (asChild) {
    const child = typeof children === 'function' ? children({ isSelected }) : children;
    if (isValidElement(child)) {
      return cloneElement(child, mergeProps(slotProps, child.props as any));
    } else if (child) {
      return child;
    }
  }

  return (
    <button {...slotProps}>
      {typeof children === 'function' ? children({ isSelected }) : children}
    </button>
  );
};

// Popover container component
const Popover = ({ asChild, children, ...props }: PopoverProps) => {
  const { showPopover, handleKeyDown, popoverId, triggerId } =
    useVoteFeedbackContext();

  if (!showPopover) {
    return null;
  }

  const slotProps = {
    ...props,
    role: 'dialog' as const,
    'aria-labelledby': triggerId,
    'aria-modal': true,
    'aria-describedby': `${popoverId}-description`,
    id: popoverId,
    onKeyDown: handleKeyDown,
    tabIndex: -1,
  };

  if (asChild && isValidElement(children)) {
    return (
      <>
        {cloneElement(children, mergeProps(slotProps, children.props as Record<string, any>))}
        <div id={`${popoverId}-description`} className="sr-only">
          Provide additional feedback for your downvote
        </div>
      </>
    );
  }

  return (
    <div {...slotProps}>
      <div id={`${popoverId}-description`} className="sr-only">
        Provide additional feedback for your downvote
      </div>
      {children}
    </div>
  );
};

// Textarea component
const Textarea = ({ asChild, value, onChange, ...props }: TextareaProps) => {
  const {
    feedbackText,
    handleTextareaChange,
    textareaRef,
    handleKeyDown,
    popoverId,
  } = useVoteFeedbackContext();

  const slotProps = {
    ...props,
    ref: textareaRef,
    value: value !== undefined ? value : feedbackText,
    onChange: onChange || handleTextareaChange,
    onKeyDown: handleKeyDown,
    placeholder: props.placeholder || 'What did we miss?',
    'aria-label': props['aria-label'] || 'Additional feedback',
    'aria-describedby': `${popoverId}-help`,
    rows: props.rows || 3,
  };

  if (asChild && isValidElement(props.children)) {
    return cloneElement(props.children, mergeProps(slotProps, props.children.props as Record<string, any>));
  }

  return (
    <textarea {...slotProps} />
  );
};

// Submit button component
const SubmitButton = ({
  asChild,
  children,
  onClick,
  ...props
}: SubmitButtonProps) => {
  const { handleSubmit, isSubmitting, feedbackText } = useVoteFeedbackContext();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleSubmit();
      onClick?.(e);
    },
    [handleSubmit, onClick]
  );

  const hasText = feedbackText.trim().length > 0;
  const buttonText = hasText ? 'Submit feedback' : 'Close without feedback';

  const slotProps = {
    ...props,
    onClick: handleClick,
    disabled: isSubmitting || props.disabled,
    type: 'button' as const,
    'aria-label': props['aria-label'] || buttonText,
    'aria-describedby': hasText ? undefined : 'submit-help',
  };

  if (asChild && isValidElement(children)) {
    return (
      <>
        {cloneElement(children, mergeProps(slotProps, children.props as Record<string, any>))}
        {!hasText && (
          <span id="submit-help" className="sr-only">
            This will close the dialog without submitting feedback
          </span>
        )}
      </>
    );
  }

  return (
    <button {...slotProps}>
      {children}
      {!hasText && (
        <span id="submit-help" className="sr-only">
          This will close the dialog without submitting feedback
        </span>
      )}
    </button>
  );
};

// Export compound component
export const VoteFeedback = {
  Root: VoteFeedbackRoot,
  UpvoteButton,
  DownvoteButton,
  Popover,
  Textarea,
  SubmitButton,
};

// Backward compatibility exports
export const ApprovalFeedback = VoteFeedback;
export { VoteFeedback as default };
