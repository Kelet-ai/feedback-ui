import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ShadcnVoteFeedback } from './vote-feedback';

const meta: Meta<typeof ShadcnVoteFeedback> = {
  title: 'UI/Shadcn/VoteFeedback',
  component: ShadcnVoteFeedback,
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
# shadcn/ui Vote Feedback Component

A **beautiful, professional** vote feedback component using **real shadcn/ui components** with **Lucide icons**.

## Quick Start
To install the component, run the following command:
\`\`\`bash
npx shadcn add https://feedback-ui.kelet.ai/r/vote-feedback.json
\`\`\`

This will add the component to your project and install the necessary dependencies.


## Key Features:
- 🎨 **Clean Design**: Compact thumbs up/down buttons with Lucide icons
- 🎯 **shadcn Popover**: Uses actual shadcn Popover component for feedback form
- 📐 **Professional Layout**: Tight spacing, proper sizing, clean typography
- 🌈 **shadcn Design System**: Follows shadcn's design tokens completely
- ♿ **Accessible**: Screen reader support with proper ARIA labels

## Components Used:
- **Button**: shadcn Button with icon sizing and variants
- **Popover**: shadcn Popover with PopoverTrigger and PopoverContent
- **Textarea**: shadcn Textarea with proper styling
- **Lucide Icons**: ThumbsUp and ThumbsDown icons
- **cn()**: shadcn's className utility

## Props:
- **variant**: Button style ('default' | 'outline' | 'ghost' | 'secondary')
- **size**: Button size ('default' | 'sm' | 'lg' | 'icon')
- **title**: Popover title
- **description**: Popover description
- **placeholder**: Textarea placeholder

Perfect for professional applications with clean, modern UI.
        `,
      },
    },
  },
  argTypes: {
    onFeedback: {
      action: 'feedback-received',
      description: 'Callback when user provides feedback',
    },
    tx_id: {
      control: 'text',
      description: 'Required transaction ID for tracking feedback',
    },
    extra_metadata: {
      control: 'object',
      description: 'Optional metadata to include with feedback',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost', 'secondary'],
      description: 'Button style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
    },
    title: {
      control: 'text',
      description: 'Popover title',
    },
    description: {
      control: 'text',
      description: 'Popover description',
    },
    placeholder: {
      control: 'text',
      description: 'Textarea placeholder',
    },
  },
  args: {
    tx_id: 'shadcn-demo',
    onFeedback: fn(args => {
      console.log('Feedback received:', args, 'type:', typeof args);
    }),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tx_id: 'shadcn-default',
    variant: 'outline',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Default** - Clean outline buttons with Lucide icons and shadcn Popover.

**Features:**
- ThumbsUp/ThumbsDown Lucide icons
- Outline button variant
- Compact 32px button size
- shadcn Popover for feedback form

Professional and clean!
        `,
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Get buttons
    const upvoteButton = canvas.getByRole('button', { name: /^helpful$/i });
    const downvoteButton = canvas.getByRole('button', { name: /not helpful/i });

    // 1. Initial state: both buttons should have the 'outline' variant
    await expect(upvoteButton).toHaveAttribute('data-selected', 'false');
    await expect(downvoteButton).toHaveAttribute('data-selected', 'false');

    // 2. Click upvote
    await userEvent.click(upvoteButton);

    // Assert upvote is selected (data-selected) and downvote is not
    await expect(upvoteButton).toHaveAttribute('data-selected', 'true');
    await expect(downvoteButton).toHaveAttribute('data-selected', 'false');
    await expect(args.onFeedback).toHaveBeenCalledWith({
      tx_id: 'shadcn-default',
      vote: 'upvote',
    });

    // 3. Click downvote
    await userEvent.click(downvoteButton);

    // Assert downvote is selected and upvote is not
    await expect(downvoteButton).toHaveAttribute('data-selected', 'true');
    await expect(upvoteButton).toHaveAttribute('data-selected', 'false');
    await expect(args.onFeedback).toHaveBeenLastCalledWith({
      tx_id: 'shadcn-default',
      vote: 'downvote',
    });

    // 4. Add detailed feedback
    const textarea = await within(document.body).findByPlaceholderText(
      'What could we do better?'
    );
    await userEvent.type(textarea, 'The explanation could be clearer');

    const submitButton = within(document.body).getByText('Submit');
    await userEvent.click(submitButton);

    await expect(args.onFeedback).toHaveBeenLastCalledWith({
      tx_id: 'shadcn-default',
      vote: 'downvote',
      explanation: 'The explanation could be clearer',
    });
  },
};

export const Ghost: Story = {
  args: {
    tx_id: 'shadcn-ghost',
    variant: 'ghost',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Ghost variant** - Minimal appearance with no borders.

**Features:**
- Ghost button styling
- Hover states only
- Most subtle appearance
        `,
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    tx_id: 'shadcn-secondary',
    variant: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Secondary variant** - Muted background styling.

**Features:**
- Secondary button styling
- Subtle background
- Professional appearance
        `,
      },
    },
  },
};

export const DefaultFilled: Story = {
  args: {
    tx_id: 'shadcn-filled',
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Default variant** - Filled button styling.

**Features:**
- Filled button background
- High contrast
- Bold appearance
        `,
      },
    },
  },
};

export const CustomContent: Story = {
  args: {
    tx_id: 'shadcn-custom',
    variant: 'outline',
    title: 'Was this helpful?',
    description: 'Let us know how we can improve this content.',
    placeholder: 'Share your specific feedback...',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Custom content** - Customized text content.

**Features:**
- Custom popover title
- Custom description
- Custom placeholder text
- Same clean design
        `,
      },
    },
  },
};

export const InlineUsage: Story = {
  args: {
    tx_id: 'shadcn-inline',
    variant: 'ghost',
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Inline usage** - Perfect for embedding in content.

Shows how the component looks when used inline with text or other content.
        `,
      },
    },
  },
  render: args => (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-muted-foreground">
        This article explains how to implement authentication in React
        applications using modern best practices.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Was this helpful?</span>
        <ShadcnVoteFeedback {...args} />
      </div>
    </div>
  ),
};
