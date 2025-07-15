# Feedback UI

A React component library for feedback UI components with both headless and styled implementations.

## Quick Start

```bash
bun install feedback-ui
```

```tsx
import { VoteFeedback } from '@kelet-ai/feedback-ui';

function App() {
  return (
    <VoteFeedback.Root 
      identifier="my-feature"
      onFeedback={(feedback) => console.log(feedback)}
    >
      <VoteFeedback.UpvoteButton>👍 Like</VoteFeedback.UpvoteButton>
      <VoteFeedback.DownvoteButton>👎 Dislike</VoteFeedback.DownvoteButton>
      <VoteFeedback.Popover>
        <VoteFeedback.Textarea placeholder="Share feedback..." />
        <VoteFeedback.SubmitButton>Send</VoteFeedback.SubmitButton>
      </VoteFeedback.Popover>
    </VoteFeedback.Root>
  );
}
```

## Features

- **Headless**: Complete control over styling and appearance
- **Accessible**: Full keyboard navigation and ARIA support
- **Framework Agnostic**: Just React - no other dependencies
- **TypeScript**: Full type safety included
- **Flexible**: Works with any styling solution

## Components

### Headless Components

```tsx
import { VoteFeedback } from '@kelet-ai/feedback-ui';

// Compound component pattern
<VoteFeedback.Root onFeedback={handleFeedback}>
  <VoteFeedback.UpvoteButton>Like</VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton>Dislike</VoteFeedback.DownvoteButton>
  <VoteFeedback.Popover>
    <VoteFeedback.Textarea />
    <VoteFeedback.SubmitButton>Submit</VoteFeedback.SubmitButton>
  </VoteFeedback.Popover>
</VoteFeedback.Root>
```

### shadcn/ui Components

```bash
npx shadcn add https://feedback-ui.kelet.ai/r/vote-feedback.json
```

```tsx
import { ShadcnVoteFeedback } from '@/components/ui/vote-feedback';

<ShadcnVoteFeedback 
  identifier="my-feature"
  onFeedback={handleFeedback}
  variant="outline"
/>
```

## API Reference

### VoteFeedback.Root

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `identifier` | `string` | ✓ | Unique identifier for tracking |
| `onFeedback` | `function` | ✓ | Callback when feedback is submitted |
| `extra_metadata` | `object` |  | Additional metadata to include |

### Feedback Object

```tsx
{
  identifier: string;
  type: 'upvote' | 'downvote';
  explanation?: string;
  extra_metadata?: object;
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
    <VoteFeedback.Textarea className="textarea" />
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
    <Icon name="thumbs-up" />
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
