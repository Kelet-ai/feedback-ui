import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { VoteFeedback } from '@/components/vote-feedback';

const meta: Meta<typeof VoteFeedback.Root> = {
  title: 'Components/VoteFeedback/Headless',
  component: VoteFeedback.Root,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          {
            // Ensure buttons have accessible names
            id: 'button-name',
            enabled: true,
          },
          {
            // Ensure interactive elements are focusable
            id: 'focusable-content',
            enabled: true,
          },
          {
            // Check ARIA attributes
            id: 'aria-valid-attr',
            enabled: true,
          },
          {
            // Check color contrast
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
    docs: {
      description: {
        component: `
# Headless VoteFeedback Component

This is a **headless** component library - it provides the logic and behavior without any styling. 
You have complete control over the appearance and can build your own design system on top of it.

## Key Features:
- 🎨 **Completely Unstyled**: No CSS included, you control the appearance
- ♿ **Accessible**: Full keyboard navigation and ARIA support
- 🔧 **Flexible**: Works with any styling solution (CSS, Tailwind, styled-components, etc.)
- 📱 **Framework Agnostic**: Just React - no other dependencies

## Philosophy:
The headless approach separates the "brain" (logic) from the "looks" (styling). This gives you maximum flexibility while handling all the complex accessibility and interaction logic for you.

## API:
- **type**: Uses 'upvote' | 'downvote' literal types
- **Components**: UpvoteButton, DownvoteButton

## Accessibility Features:
- ♿ **ARIA Support**: Proper roles, states, and labels
- ⌨️ **Keyboard Navigation**: Tab, Enter, Space, Escape support
- 🎯 **Focus Management**: Auto-focus and focus restoration
- 📢 **Screen Reader**: Comprehensive screen reader support
        `,
      },
    },
  },
  argTypes: {
    onFeedback: {
      action: 'feedback-received',
      description: 'Callback when user provides feedback',
    },
    identifier: {
      control: 'text',
      description: 'Required identifier for tracking feedback',
    },
    extra_metadata: {
      control: 'object',
      description: 'Optional metadata to include with feedback',
    },
  },
  args: {
    identifier: 'story-demo',
    onFeedback: fn(args => {
      console.log('Feedback received:', args, 'type:', typeof args);
    }),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HeadlessBasic: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test upvote button
    const upvoteButton = canvas.getByText('👍 Like');
    await userEvent.click(upvoteButton);

    await expect(args.onFeedback).toHaveBeenCalledWith({
      identifier: 'story-demo',
      type: 'upvote',
    });
  },
  render: args => (
    <VoteFeedback.Root {...args}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <VoteFeedback.UpvoteButton
            style={{
              padding: '8px 16px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            👍 Like
          </VoteFeedback.UpvoteButton>

          <VoteFeedback.DownvoteButton
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            👎 Dislike
          </VoteFeedback.DownvoteButton>
        </div>

        <VoteFeedback.Popover
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '8px',
            padding: '16px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '300px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              marginBottom: '12px',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            What did we miss?
          </div>
          <VoteFeedback.Textarea
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              resize: 'none',
              marginBottom: '12px',
              minHeight: '80px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            placeholder="Share your feedback..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <VoteFeedback.SubmitButton
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Send
            </VoteFeedback.SubmitButton>
          </div>
        </VoteFeedback.Popover>
      </div>
    </VoteFeedback.Root>
  ),
};

export const HeadlessCustomStyling: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test downvote flow with feedback text
    const downvoteButton = canvas.getByText('🚫 Not Good');
    await userEvent.click(downvoteButton);

    const textarea = canvas.getByRole('textbox');
    await userEvent.type(textarea, 'Could be improved');

    const submitButton = canvas.getByText('Submit Feedback');
    await userEvent.click(submitButton);

    await expect(args.onFeedback).toHaveBeenCalledWith({
      identifier: 'story-demo',
      type: 'downvote',
      explanation: 'Could be improved',
    });
  },
  render: args => (
    <VoteFeedback.Root {...args}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <VoteFeedback.UpvoteButton
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            ✨ Awesome!
          </VoteFeedback.UpvoteButton>

          <VoteFeedback.DownvoteButton
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
          >
            🚫 Not Good
          </VoteFeedback.DownvoteButton>
        </div>

        <VoteFeedback.Popover
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '12px',
            padding: '24px',
            backgroundColor: '#fafafa',
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            width: '350px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              marginBottom: '16px',
              fontWeight: '600',
              fontSize: '16px',
              color: '#374151',
            }}
          >
            Help us improve! 🎯
          </div>
          <VoteFeedback.Textarea
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              resize: 'none',
              marginBottom: '16px',
              minHeight: '100px',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: 'white',
            }}
            placeholder="What could we do better?"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <VoteFeedback.SubmitButton
              style={{
                padding: '12px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
            >
              Submit Feedback
            </VoteFeedback.SubmitButton>
          </div>
        </VoteFeedback.Popover>
      </div>
    </VoteFeedback.Root>
  ),
};

export const HeadlessMinimal: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test downvote with no text (should get immediate callback only)
    const downButton = canvas.getByText('↓');
    await userEvent.click(downButton);

    const sendButton = canvas.getByText('Send');
    await userEvent.click(sendButton);

    await expect(args.onFeedback).toHaveBeenCalledWith({
      identifier: 'story-demo',
      type: 'downvote',
    });
  },
  render: args => (
    <VoteFeedback.Root {...args}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <VoteFeedback.UpvoteButton
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              color: '#22c55e',
              border: '1px solid #22c55e',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ↑
          </VoteFeedback.UpvoteButton>

          <VoteFeedback.DownvoteButton
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ↓
          </VoteFeedback.DownvoteButton>
        </div>

        <VoteFeedback.Popover
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '4px',
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '200px',
            zIndex: 10,
          }}
        >
          <VoteFeedback.Textarea
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid #ccc',
              borderRadius: '2px',
              resize: 'none',
              marginBottom: '4px',
              minHeight: '40px',
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
            placeholder="Feedback..."
          />
          <VoteFeedback.SubmitButton
            style={{
              padding: '4px 8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '12px',
              float: 'right',
            }}
          >
            Send
          </VoteFeedback.SubmitButton>
        </VoteFeedback.Popover>
      </div>
    </VoteFeedback.Root>
  ),
};
export const CompleteWorkflow: Story = {
  args: {
    identifier: 'workflow-test',
    extra_metadata: {
      userId: 'user-123',
      sessionId: 'session-456',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Comprehensive interaction test** that automatically demonstrates all functionality:

1. **Upvote flow** - Click thumbs up and see action logged
2. **Downvote with text** - Open popover, type feedback, submit
3. **Empty submit** - Submit without text just closes popover
4. **Metadata inclusion** - All callbacks include identifier and extra_metadata

Watch the **Interactions** panel to see automated testing, and **Actions** panel for callback data!
        `,
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test 1: Upvote flow
    const upvoteButton = canvas.getByText('👍 Like');
    await userEvent.click(upvoteButton);

    await expect(args.onFeedback).toHaveBeenCalledWith({
      identifier: 'workflow-test',
      extra_metadata: {
        userId: 'user-123',
        sessionId: 'session-456',
      },
      type: 'upvote',
    });

    // Test 2: Downvote with immediate callback first
    const downvoteButton = canvas.getByText('👎 Dislike');
    await userEvent.click(downvoteButton);

    // Should immediately send feedback (no explanation)
    await expect(args.onFeedback).toHaveBeenLastCalledWith({
      identifier: 'workflow-test',
      extra_metadata: {
        userId: 'user-123',
        sessionId: 'session-456',
      },
      type: 'downvote',
    });

    // Then user can provide detailed feedback
    await userEvent.type(canvas.getByRole('textbox'), 'This needs improvement');

    await userEvent.click(canvas.getByText('Send'));

    await expect(args.onFeedback).toHaveBeenLastCalledWith({
      identifier: 'workflow-test',
      extra_metadata: {
        userId: 'user-123',
        sessionId: 'session-456',
      },
      type: 'downvote',
      explanation: 'This needs improvement',
    });

    // Test 3: Downvote without submitting text (should only get initial callback)
    await userEvent.click(downvoteButton);

    // This should send feedback immediately
    await expect(args.onFeedback).toHaveBeenLastCalledWith({
      identifier: 'workflow-test',
      extra_metadata: {
        userId: 'user-123',
        sessionId: 'session-456',
      },
      type: 'downvote',
    });

    // Clicking submit without text should just close (no additional call)
    const callsBefore = [...(args.onFeedback as any).mock.calls];
    await userEvent.click(canvas.getByText('Send'));

    // Compare call arrays
    expect((args.onFeedback as any).mock.calls).toEqual(callsBefore);
  },
  render: args => (
    <VoteFeedback.Root {...args}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <VoteFeedback.UpvoteButton
            style={{
              padding: '8px 16px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            👍 Like
          </VoteFeedback.UpvoteButton>

          <VoteFeedback.DownvoteButton
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            👎 Dislike
          </VoteFeedback.DownvoteButton>
        </div>

        <VoteFeedback.Popover
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '8px',
            padding: '16px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '300px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              marginBottom: '12px',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            What could be better?
          </div>
          <VoteFeedback.Textarea
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              resize: 'none',
              marginBottom: '12px',
              minHeight: '80px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            placeholder="Share your feedback..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <VoteFeedback.SubmitButton
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Send
            </VoteFeedback.SubmitButton>
          </div>
        </VoteFeedback.Popover>
      </div>
    </VoteFeedback.Root>
  ),
};
