# Feedback UI

A headless React component to collect feedback for product and AI features.

## Quick Start with shadcn/ui

The easiest way to start is by using the shadcn/ui theme for instant, beautiful results:

```bash
npx shadcn add https://feedback-ui.kelet.ai/r/vote-feedback.json
```

```tsx
import { ShadcnVoteFeedback } from '@/components/ui/vote-feedback';

function App() {
  return (
    <ShadcnVoteFeedback
      identifier="my-feature"
      onFeedback={feedback => console.log(feedback)}
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

### 3. Automatic Feedback with useFeedbackState

Capture user behavior implicitly with our intelligent state hook:

```tsx
import { useFeedbackState } from '@kelet-ai/feedback-ui';

function ContentEditor() {
  // Drop-in useState replacement that tracks changes
  const [content, setContent] = useFeedbackState(
    'Start writing...',
    'content-editor'
  );

  return (
    <textarea
      value={content}
      onChange={e => setContent(e.target.value)}
      placeholder="Edit this content..."
    />
  );
  // 🎯 Automatically sends feedback when user stops editing!
}
```

## Three Ways to Use

### 1. Start Fast with shadcn/ui (Recommended)

Get beautiful, production-ready components instantly. Perfect for most use cases:

```tsx
import { ShadcnVoteFeedback } from '@/components/ui/vote-feedback';

<ShadcnVoteFeedback
  identifier="my-feature"
  onFeedback={handleFeedback}
  variant="outline"
/>;
```

### 2. Go Headless for Full Control

When you need complete design control, use the headless components.

First, install the package:

```console
npm install @kelet-ai/feedback-ui
```

Then, import the headless components, and style them as you see fit:
```tsx
import { VoteFeedback } from '@kelet-ai/feedback-ui';

<VoteFeedback.Root onFeedback={handleFeedback}>
  <VoteFeedback.UpvoteButton className="your-styles">
    👍 Like
  </VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton className="your-styles">
    👎 Dislike
  </VoteFeedback.DownvoteButton>
  <VoteFeedback.Popover className="your-popover">
    <VoteFeedback.Textarea placeholder="What could be better?" />
    <VoteFeedback.SubmitButton>Send</VoteFeedback.SubmitButton>
  </VoteFeedback.Popover>
</VoteFeedback.Root>;
```

## Features

- **Accessible**: Full keyboard navigation and ARIA support
- **TypeScript**: Complete type safety included
- **Flexible**: Works with any styling solution
- **Zero Dependencies**: Just React - no other dependencies
- **Automatic Feedback**: `useFeedbackState` hook captures implicit user behavior

## API Reference

### VoteFeedback.Root

| Prop             | Type       | Required | Description                                     |
| ---------------- | ---------- | -------- | ----------------------------------------------- |
| `identifier`     | `string`   | ✓        | Unique identifier for tracking                  |
| `onFeedback`     | `function` | ✓        | Callback when feedback is submitted             |
| `extra_metadata` | `object`   |          | Additional metadata to include                  |
| `trigger_name`   | `string`   |          | Optional trigger name for categorizing feedback |

### Feedback Object

```tsx
{
    identifier: string;
    vote: 'upvote' | 'downvote';
    explanation ? : string;
    extra_metadata ? : object;
    source ? : 'IMPLICIT' | 'EXPLICIT';
    correction ? : string;
    selection ? : string;
    trigger_name ? : string; // Optional trigger name for categorizing feedback
}
```

## useFeedbackState Hook

The `useFeedbackState` hook is a **drop-in replacement for React's useState** that automatically tracks state changes
and sends implicit feedback through the Kelet system. Perfect for capturing user behavior without explicit feedback
prompts.

### Key Features

- 🔄 **Drop-in useState replacement** - Same API signature and behavior
- 🎯 **Automatic diff detection** - Only triggers on actual changes
- ⏱️ **Smart debouncing** - Prevents feedback spam (default: 1500ms)
- 📊 **Multiple diff formats** - Git, object, or JSON diff formats
- 🎭 **Dynamic identifiers** - Can derive identifier from state
- 🎚️ **Intelligent vote determination** - Automatic upvote/downvote based on change magnitude
- 🔍 **Custom comparison** - Support for custom equality functions

### Basic Usage

```tsx
import { useFeedbackState } from '@kelet-ai/feedback-ui';

function MyComponent() {
  // Drop-in replacement for useState
  const [count, setCount] = useFeedbackState(0, 'counter-widget');

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Advanced Usage

```tsx
import { useFeedbackState } from '@kelet-ai/feedback-ui';

function UserProfile() {
  const [profile, setProfile] = useFeedbackState(
    { name: '', email: '', preferences: {} },
    state => `profile-${state.email}`, // Dynamic identifier
    {
      debounceMs: 2000, // Wait 2s before sending feedback
      diffType: 'object', // Use object diff format
      metadata: {
        component: 'UserProfile',
        version: '1.2.0',
      },
      compareWith: (a, b) => {
        // Custom comparison function
        return a.name === b.name && a.email === b.email;
      },
    }
  );

  return (
    <form>
      <input
        value={profile.name}
        onChange={e => setProfile({ ...profile, name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={profile.email}
        onChange={e => setProfile({ ...profile, email: e.target.value })}
        placeholder="Email"
      />
    </form>
  );
}
```

### Trigger Names for State Changes

The `useFeedbackState` hook supports **trigger names** to categorize and track different types of state changes. This
powerful feature allows you to understand the context and cause of state changes in your feedback data.

#### Basic Usage with Trigger Names

```tsx
const [content, setContent] = useFeedbackState(
  'Initial content',
  'content-editor',
  {
    default_trigger_name: 'manual_edit', // Default for all changes
  }
);

// Uses default trigger name
setContent('User typed this');

// Override with specific trigger name
setContent('AI generated this', 'ai_assistance');
setContent('Spell checker fixed this', 'spell_check');
```

#### Trigger Switching - Advanced Behavior

When you change trigger names, the hook **immediately flushes** the previous sequence and starts a new one:

```tsx
const [draft, setDraft] = useFeedbackState('', 'email-draft');

setDraft('Hello', 'manual_typing'); // Starts debouncing for 'manual_typing'
setDraft('Hello world', 'manual_typing'); // Extends debounce (same trigger)
setDraft('Hello world!', 'ai_suggestion'); // IMMEDIATELY sends 'manual_typing' feedback
// then starts new 'ai_suggestion' sequence
```

This creates two separate feedback entries:

1. **manual_typing**: `'' → 'Hello world'`
2. **ai_suggestion**: `'Hello world' → 'Hello world!'`

#### Real-world Examples

```tsx
// Content creation with different interaction types
const [article, setArticle] = useFeedbackState(
  { title: '', content: '', tags: [] },
  'article-editor',
  {
    default_trigger_name: 'user_input',
    debounceMs: 2000,
  }
);

// User typing
setArticle({ ...article, title: 'My Article' }, 'user_input');

// AI assistance
setArticle(
  {
    ...article,
    content: 'AI generated introduction...',
  },
  'ai_generation'
);

// Grammar correction
setArticle(
  {
    ...article,
    content: 'AI-generated introduction...',
  },
  'grammar_fix'
);

// User refinement
setArticle(
  {
    ...article,
    content: 'AI-generated introduction with my changes...',
  },
  'user_refinement'
);
```

#### Common Trigger Name Patterns

```tsx
// Content creation and editing
{
  default_trigger_name: 'manual_edit';
}
'user_typing' | 'copy_paste' | 'drag_drop';

// AI interactions
'ai_generation' | 'ai_completion' | 'ai_correction';
'prompt_result' | 'ai_suggestion_accepted';

// Automated changes
'spell_check' | 'auto_format' | 'auto_save';
'validation_fix' | 'import_data';

// User interactions
'voice_input' | 'gesture_input' | 'shortcut_key';
'context_menu' | 'toolbar_action';

// Workflow steps
'draft' | 'review' | 'approval' | 'publication';
'undo' | 'redo' | 'revert';
```

#### Advanced Pattern: Context-Aware Triggers

```tsx
function SmartEditor() {
  const [document, setDocument] = useFeedbackState(
    { content: '', metadata: {} },
    'smart-editor',
    { default_trigger_name: 'user_edit' }
  );

  const handleUserInput = text => {
    setDocument({ ...document, content: text }, 'user_typing');
  };

  const handleAIComplete = completion => {
    setDocument(
      {
        ...document,
        content: document.content + completion,
      },
      'ai_completion'
    );
  };

  const handleSpellCheck = correctedText => {
    setDocument(
      {
        ...document,
        content: correctedText,
      },
      'spell_check'
    );
  };

  const handleImport = importedData => {
    setDocument(importedData, 'data_import');
  };
}
```

#### Benefits of Trigger Names

1. **Categorize Feedback** - Group feedback by interaction type
2. **Track User Behavior** - Understand how users interact with features
3. **Measure AI Impact** - See how often AI suggestions are used vs manual input
4. **Debug Issues** - Identify problematic interaction patterns
5. **Optimize UX** - Focus improvements on frequently used triggers

#### Analytics Insights

With trigger names, you can analyze:

- **User vs AI ratio**: How much content comes from AI vs manual input?
- **Correction patterns**: Are users frequently fixing AI suggestions?
- **Workflow efficiency**: Which triggers lead to the most refinements?
- **Feature adoption**: Are new features being used as intended?

### API Reference

```tsx
function useFeedbackState<T>(
  initialState: T,
  identifier: string | ((state: T) => string),
  options?: DiffOptions<T>
): [T, (value: SetStateAction<T>, trigger_name?: string) => void];
```

#### Parameters

| Parameter      | Type                             | Required | Description                    |
| -------------- | -------------------------------- | -------- | ------------------------------ |
| `initialState` | `T`                              | ✓        | Initial state value (any type) |
| `identifier`   | `string \| (state: T) => string` | ✓        | Unique identifier for tracking |
| `options`      | `DiffOptions<T>`                 |          | Configuration options          |

#### DiffOptions

| Option                 | Type                                    | Default               | Description                                       |
| ---------------------- | --------------------------------------- | --------------------- | ------------------------------------------------- |
| `debounceMs`           | `number`                                | `1500`                | Debounce time in milliseconds                     |
| `diffType`             | `'git' \| 'object' \| 'json'`           | `'git'`               | Format for diff output                            |
| `compareWith`          | `(a: T, b: T) => boolean`               |                       | Custom equality comparison function               |
| `metadata`             | `Record<string, any>`                   |                       | Additional metadata to include                    |
| `onFeedback`           | `(data: FeedbackData) => Promise<void>` |                       | Custom feedback handler (for testing)             |
| `vote`                 | `'upvote' \| 'downvote' \| function`    |                       | Static vote or custom function for determination  |
| `default_trigger_name` | `string`                                | `'auto_state_change'` | Default trigger name when no trigger is specified |

### How It Works

1. **State Changes**: When state updates, the hook captures the change
2. **Debouncing**: Multiple rapid changes extend the timer (user is still editing)
3. **Diff Calculation**: Once changes stop, calculates the difference from start to final state
4. **Vote Determination**:
   - **≤50% change** = `upvote` (minor refinement)
   - **>50% change** = `downvote` (major revision)
5. **Automatic Feedback**: Sends implicit feedback with diff data in the `correction` field

### Diff Formats

#### Git Diff (default)

```
---
+++
@@ -1,1 +1,1 @@
-{"name": "John"}
+{"name": "John Doe"}
```

#### Object Diff

```json
[
  {
    "kind": "E",
    "path": ["name"],
    "lhs": "John",
    "rhs": "John Doe"
  }
]
```

#### JSON Diff

```json
{
  "before": {
    "name": "John"
  },
  "after": {
    "name": "John Doe"
  }
}
```

### Use Cases

- **Form editing** - Track user input patterns and corrections
- **Content creation** - Understand how users refine their writing
- **Configuration changes** - Monitor settings adjustments
- **Data visualization** - Capture how users explore and filter data
- **AI interactions** - Learn from user modifications to AI-generated content

### Vote Configuration

Control how changes are classified with the `vote` option:

#### Static Vote

```tsx
// Always upvote - useful for content creation tools
const [content, setContent] = useFeedbackState('Draft...', 'content-editor', {
  vote: 'upvote',
});

// Always downvote - useful for error tracking
const [errors, setErrors] = useFeedbackState([], 'error-log', {
  vote: 'downvote',
});
```

#### Custom Vote Function

```tsx
// Business logic-based voting
const [issue, setIssue] = useFeedbackState(
  { priority: 1, severity: 'low' },
  'issue-tracker',
  {
    vote: (before, after, diffPercentage) => {
      // Priority increase = positive change
      if (after.priority > before.priority) return 'upvote';
      if (after.priority < before.priority) return 'downvote';

      // Severity increase = negative change
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      const beforeSev = severityOrder[before.severity] || 1;
      const afterSev = severityOrder[after.severity] || 1;

      // Fall back to diff percentage for other cases
      return afterSev > beforeSev
        ? 'downvote'
        : diffPercentage > 0.7
          ? 'downvote'
          : 'upvote';
    },
  }
);
```

#### Advanced Vote Logic Examples

```tsx
// Content quality assessment
const [article, setArticle] = useFeedbackState(
  { title: '', content: '', tags: [] },
  'article-editor',
  {
    vote: (before, after, diffPercentage) => {
      // More tags = improvement
      if (after.tags.length > before.tags.length) return 'upvote';

      // Significant content expansion = improvement
      const contentGrowth =
        after.content.length / Math.max(before.content.length, 1);
      if (contentGrowth > 1.2) return 'upvote';

      // Major changes might indicate problems
      return diffPercentage > 0.6 ? 'downvote' : 'upvote';
    },
  }
);

// User experience tracking
const [settings, setSettings] = useFeedbackState(
  { theme: 'light', notifications: true, autoSave: false },
  'user-preferences',
  {
    vote: (before, after, diffPercentage) => {
      // Enabling helpful features = positive
      if (after.autoSave && !before.autoSave) return 'upvote';
      if (after.notifications && !before.notifications) return 'upvote';

      // Disabling features might indicate UX issues
      if (!after.autoSave && before.autoSave) return 'downvote';

      // Small tweaks are usually positive
      return diffPercentage < 0.3 ? 'upvote' : 'downvote';
    },
  }
);
```

### Best Practices

```tsx
// ✅ Good: Static identifier for consistent tracking
const [settings, setSettings] = useFeedbackState(
  defaultSettings,
  'user-settings'
);

// ✅ Good: Dynamic identifier that makes sense
const [items, setItems] = useFeedbackState(
  [],
  items => `shopping-cart-${items.length}-items`
);

// ✅ Good: Appropriate debounce for use case
const [searchQuery, setSearchQuery] = useFeedbackState(
  '',
  'search-input',
  { debounceMs: 800 } // Shorter for search
);

// ✅ Good: Custom vote logic for domain-specific scenarios
const [formData, setFormData] = useFeedbackState(initialForm, 'contact-form', {
  vote: (before, after, diffPercentage) => {
    // Form completion = positive signal
    const beforeFields = Object.values(before).filter(Boolean).length;
    const afterFields = Object.values(after).filter(Boolean).length;
    return afterFields > beforeFields ? 'upvote' : 'downvote';
  },
});

// ❌ Avoid: Very short debounce times
const [text, setText] = useFeedbackState(
  '',
  'editor',
  { debounceMs: 50 } // Too aggressive
);

// ❌ Avoid: Overly complex vote logic
const [data, setData] = useFeedbackState({}, 'complex-data', {
  vote: (before, after, diffPercentage) => {
    // Don't make it too complicated - keep it readable!
    // Complex business logic should be in separate functions
    return determineVoteFromBusinessLogic(before, after, diffPercentage);
  },
});
```

## Examples

### Basic Usage

```tsx
<VoteFeedback.Root onFeedback={feedback => console.log(feedback)}>
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

### With Trigger Name

```tsx
<VoteFeedback.Root
  onFeedback={handleFeedback}
  identifier="ai-response"
  trigger_name="user_feedback"
>
  <VoteFeedback.UpvoteButton>👍 Helpful</VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton>👎 Not helpful</VoteFeedback.DownvoteButton>
  <VoteFeedback.Popover>
    <VoteFeedback.Textarea placeholder="How can we improve?" />
    <VoteFeedback.SubmitButton>Send feedback</VoteFeedback.SubmitButton>
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
bun run test:unit # Run unit tests
bun run test:storybook # Run Storybook tests
bun build # Build library
```

## License

MIT
