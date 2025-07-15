# Feedback UI

A headless React component to collect feedback for product and AI features.

## Quick Start with shadcn/ui

The easiest way to start is by using the shadcn/ui theme for instant, beautiful results:

```bash
npx shadcn add https://feedback-ui.kelet.ai/r/vote-feedback.json
```

```tsx
import {ShadcnVoteFeedback} from '@/components/ui/vote-feedback';

function App() {
    return (
        <ShadcnVoteFeedback
            identifier="my-feature"
            onFeedback={(feedback) => console.log(feedback)}
            variant="outline"
        />
    );
}
```

## Why Feedback UI?

Perfect for collecting user feedback on:

- **Product features** - Get user reactions to new functionality
- **AI responses** - Improve AI models with user feedback
- **Documentation** - Learn what content helps users
- **UI components** - Validate design decisions

## Two Ways to Use

### 1. Start Fast with shadcn/ui (Recommended)

Get beautiful, production-ready components instantly. Perfect for most use cases:

```tsx
import {ShadcnVoteFeedback} from '@/components/ui/vote-feedback';

<ShadcnVoteFeedback
    identifier="my-feature"
    onFeedback={handleFeedback}
    variant="outline"
/>
```

### 2. Go Headless for Full Control

When you need complete design control, use the headless components:

```tsx
import {VoteFeedback} from '@kelet-ai/feedback-ui';

<VoteFeedback.Root onFeedback={handleFeedback}>
    <VoteFeedback.UpvoteButton className="your-styles">
        👍 Like
    </VoteFeedback.UpvoteButton>
    <VoteFeedback.DownvoteButton className="your-styles">
        👎 Dislike
    </VoteFeedback.DownvoteButton>
    <VoteFeedback.Popover className="your-popover">
        <VoteFeedback.Textarea placeholder="What could be better?"/>
        <VoteFeedback.SubmitButton>Send</VoteFeedback.SubmitButton>
    </VoteFeedback.Popover>
</VoteFeedback.Root>
```

## Features

- **Accessible**: Full keyboard navigation and ARIA support
- **TypeScript**: Complete type safety included
- **Flexible**: Works with any styling solution
- **Zero Dependencies**: Just React - no other dependencies

## API Reference

### VoteFeedback.Root

| Prop             | Type       | Required | Description                         |
|------------------|------------|----------|-------------------------------------|
| `identifier`     | `string`   | ✓        | Unique identifier for tracking      |
| `onFeedback`     | `function` | ✓        | Callback when feedback is submitted |
| `extra_metadata` | `object`   |          | Additional metadata to include      |

### Feedback Object

```tsx
{
    identifier: string;
    type: 'upvote' | 'downvote';
    explanation ? : string;
    extra_metadata ? : object;
}
```

## Examples

### Basic Usage

```tsx
<VoteFeedback.Root onFeedback={(feedback) => console.log(feedback)}>
    <VoteFeedback.UpvoteButton>👍</VoteFeedback.UpvoteButton>
    <VoteFeedback.DownvoteButton>👎</VoteFeedback.DownvoteButton>
</VoteFeedback.Root>
```

### With Custom Styling

```tsx
<VoteFeedback.Root onFeedback={handleFeedback}>
    <VoteFeedback.UpvoteButton className="btn btn-success">
        Like
    </VoteFeedback.UpvoteButton>
    <VoteFeedback.DownvoteButton className="btn btn-danger">
        Dislike
    </VoteFeedback.DownvoteButton>
    <VoteFeedback.Popover className="popover">
        <VoteFeedback.Textarea className="textarea"/>
        <VoteFeedback.SubmitButton className="btn btn-primary">
            Submit
        </VoteFeedback.SubmitButton>
    </VoteFeedback.Popover>
</VoteFeedback.Root>
```

### Using asChild Pattern

```tsx
<VoteFeedback.UpvoteButton asChild>
    <button className="custom-button">
        <Icon name="thumbs-up"/>
        Like
    </button>
</VoteFeedback.UpvoteButton>
```

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatible

## Development

```bash
bun install
bun dev  # Start Storybook
bun test # Run tests
bun build # Build library
```

## License

MIT
