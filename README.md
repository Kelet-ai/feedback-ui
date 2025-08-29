# Feedback UI

<!-- METADATA
**Project Type**: React Component and Hooks Library
**Primary Use Case**: User Feedback Collection. Especially great for learning from interactions with AI systems.
**Framework**: React 19+, TypeScript, Headless UI
**Installation**: `npm install @kelet-ai/feedback-ui` or with your preferred package manager. If using shadcn/ui, use `npx shadcn add https://feedback-ui.kelet.ai/r/vote-feedback.json` or with your preferred package manager.
-->

> **A headless React component to collect feedback for product and AI features.**

Perfect for capturing user reactions to AI-generated content, new features, documentation, and UI components with both
explicit voting interfaces and implicit behavior tracking.

---

## 🚀 Quick Start

Get beautiful feedback components in 30 seconds with shadcn/ui integration:

```bash
npx shadcn add https://feedback-ui.kelet.ai/r/vote-feedback.json
```

```tsx
import { ShadcnVoteFeedback } from '@/components/ui/vote-feedback';

function App() {
  return (
    <ShadcnVoteFeedback
      tx_id="my-feature"
      onFeedback={feedback => console.log(feedback)}
      variant="outline"
    />
  );
}
```

**Result**: Fully styled thumbs up/down buttons with popover feedback form.

---

## ✨ Why Feedback UI?

### **Perfect For**

- **🤖 AI Response Feedback** - Improve models with user reactions
- **🆕 Product Feature Validation** - Get user sentiment on new functionality
- **📚 Documentation Effectiveness** - Learn what content helps users
- **🎨 UI/UX Component Testing** - Validate design decisions

### **Key Benefits**

- **🎯 Headless Architecture** - Complete design control
- **♿ Accessibility First** - ARIA support, keyboard navigation, focus management
- **📊 Implicit Tracking** - Capture user behavior without explicit feedback prompts
- **🔒 TypeScript Native** - Full type safety included
- **⚡ Zero Dependencies** - Just React, no other deps
- **🎨 Flexible Styling** - Works with any CSS framework

---

## 📋 Installation Methods

### **Option 1: shadcn/ui (Recommended)**

First [install shadcn/ui](https://ui.shadcn.com/docs/installation) and then:

```bash
npx shadcn add https://feedback-ui.kelet.ai/r/vote-feedback.json
```

✅ **Best for**: Quick setup with beautiful pre-styled components

### **Option 2: NPM Package**

```bash
npm install @kelet-ai/feedback-ui
```

✅ **Best for**: Full control over styling and behavior

---

## 🎯 Usage Patterns

### **Pattern 1: Explicit Feedback (Most Common)**

Users explicitly vote and provide comments:

```tsx
import { VoteFeedback } from '@kelet-ai/feedback-ui';

<VoteFeedback.Root onFeedback={handleFeedback} tx_id="ai-response">
  <VoteFeedback.UpvoteButton>👍 Helpful</VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton>👎 Not helpful</VoteFeedback.DownvoteButton>
  <VoteFeedback.Popover>
    <VoteFeedback.Textarea placeholder="How can we improve?" />
    <VoteFeedback.SubmitButton>Send feedback</VoteFeedback.SubmitButton>
  </VoteFeedback.Popover>
</VoteFeedback.Root>;
```

### **Pattern 2: Implicit State Tracking**

Capture user behavior automatically by using a drop-in replacement for useState:

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

### **Pattern 3: Complex State with Reducer**

For advanced state management with automatic trigger tracking, by using a drop-in replacement for useReducer:

```tsx
import { useFeedbackReducer } from '@kelet-ai/feedback-ui';

function TodoApp() {
  const [todos, dispatch] = useFeedbackReducer(todoReducer, [], 'todo-app');

  return (
    <button onClick={() => dispatch({ type: 'ADD_TODO', text: 'New task' })}>
      Add Todo
    </button>
    // 🎯 Automatically sends feedback with trigger_name: 'ADD_TODO'
  );
}
```

---

## 💡 Core Concepts

Understanding these fundamental concepts will help you implement feedback collection effectively:

### **🔑 Identifiers**

**What**: Unique tracking ID that connects feedback to its context  
**Purpose**: Links feedback to specific sessions, users, or content pieces  
**Best Practice**: Use traceable IDs from your logging system (session ID, trace ID, request ID)

```tsx
// ✅ Good: Traceable tx_id
<VoteFeedback.Root tx_id="session-abc123-ai-response-456"/>

// ✅ Good: Content-based tx_id
<VoteFeedback.Root tx_id={`article-${articleId}-section-${sectionId}`}/>

// ❌ Poor: Generic tx_id
<VoteFeedback.Root tx_id="feedback"/>
```

### **📊 Feedback Sources**

Controls how feedback is collected and what data is captured:

#### **Explicit Feedback**

- **What**: Users actively vote and provide comments
- **When to use**: Direct user opinions, satisfaction surveys, feature ratings
- **Data captured**: Vote (upvote/downvote), comments, metadata
- **User experience**: Interactive buttons and forms

```tsx
// Explicit feedback - user clicks buttons
<VoteFeedback.Root onFeedback={handleExplicitFeedback}>
  <VoteFeedback.UpvoteButton>👍 Helpful</VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton>👎 Not helpful</VoteFeedback.DownvoteButton>
</VoteFeedback.Root>
```

#### **Implicit Feedback**

- **What**: Automatic behavior tracking without user prompts
- **When to use**: Content editing, user interactions, workflow analysis
- **Data captured**: State diffs, interaction patterns, timing data
- **User experience**: Seamless, no interruption

```tsx
// Implicit feedback - tracks changes automatically
const [content, setContent] = useFeedbackState(
  'Initial content',
  'content-editor'
);
// Sends feedback when user stops editing
```

### **🏷️ Trigger Names**

Categorization system for grouping and analyzing feedback:

#### **Purpose**

- **Group related feedback** for analysis
- **Track interaction types** (manual vs AI-assisted)
- **Measure feature adoption** and usage patterns
- **Debug user experience** issues

#### **Common Patterns**

```tsx
// Content creation triggers
'user_typing' | 'ai_generation' | 'spell_check' | 'auto_format';

// User interaction triggers
'manual_edit' | 'voice_input' | 'copy_paste' | 'drag_drop';

// Workflow triggers
'draft' | 'review' | 'approval' | 'publication';

// AI interaction triggers
'ai_completion' | 'ai_correction' | 'prompt_result';
```

#### **Dynamic Trigger Names**

```tsx
const [document, setDocument] = useFeedbackState(
  initialDoc,
  'document-editor',
  { default_trigger_name: 'user_edit' }
);

// Different triggers for different actions
setDocument(aiGeneratedContent, 'ai_generation');
setDocument(userEditedContent, 'manual_refinement');
setDocument(spellCheckedContent, 'spell_check');
```

### **🔄 State Change Tracking**

For implicit feedback, understanding how state changes are processed:

#### **Debouncing Logic**

```tsx
// User types: "Hello" → "Hello World" → "Hello World!"
// Only sends ONE feedback after user stops typing
const [text, setText] = useFeedbackState('', 'editor', {
  debounceMs: 1500, // Wait 1.5s after last change
});
```

#### **Diff Calculation**

Three formats available for different use cases:

| Format   | Best For            | Output              |
| -------- | ------------------- | ------------------- |
| `git`    | Code/text changes   | Unified diff format |
| `object` | Structured data     | Deep object diff    |
| `json`   | Simple before/after | JSON comparison     |

#### **Vote Determination**

Automatic classification of changes:

```tsx
// Smart vote logic based on change magnitude
const [data, setData] = useFeedbackState(initial, 'tracker', {
  vote: (before, after, diffPercentage) => {
    // Small changes = refinement (positive)
    if (diffPercentage <= 0.5) return 'upvote';
    // Large changes = major revision (might indicate issues)
    return 'downvote';
  },
});
```

### **🎯 Best Practices Summary**

#### **Identifiers**

✅ Use traceable session/request IDs  
✅ Include context in tx_id structure  
✅ Keep tx_ids consistent across related actions

#### **Feedback Sources**

✅ Use explicit feedback for user opinions  
✅ Use implicit feedback for behavior analysis  
✅ Combine both for comprehensive insights

#### **Trigger Names**

✅ Use consistent naming conventions  
✅ Group related triggers with prefixes  
✅ Document trigger meanings for your team

#### **Integration**

✅ Handle feedback data asynchronously  
✅ Include relevant metadata for context  
✅ Test both explicit and implicit flows

---

## 🔗 OpenTelemetry Integration

Automatically extract trace IDs to correlate feedback with distributed traces:

```tsx
import { VoteFeedback, getOtelTraceId } from '@kelet-ai/feedback-ui';

<VoteFeedback.Root tx_id={getOtelTraceId} onFeedback={handleFeedback}>
  <VoteFeedback.UpvoteButton>👍</VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton>👎</VoteFeedback.DownvoteButton>
</VoteFeedback.Root>;
```

Requires `@opentelemetry/api` and active Span to collect the trace_id from.

---

## 🔧 Core Components

### **VoteFeedback.Root**

Main container component that manages feedback state.

```tsx
<VoteFeedback.Root
  tx_id="unique-id" // Required: Unique tracking ID
  onFeedback={handleFeedback} // Required: Callback function
  trigger_name="user_feedback" // Optional: Categorization
  extra_metadata={{ page: 'home' }} // Optional: Additional data
>
  {/* Child components */}
</VoteFeedback.Root>
```

### **VoteFeedback.UpvoteButton / DownvoteButton**

Interactive voting buttons with built-in state management.

```tsx
<VoteFeedback.UpvoteButton className="your-styles">
  👍 Like
</VoteFeedback.UpvoteButton>
```

### **VoteFeedback.Popover**

Context-aware feedback form that appears after voting.

```tsx
<VoteFeedback.Popover className="your-popover-styles">
  <VoteFeedback.Textarea placeholder="Tell us more..." />
  <VoteFeedback.SubmitButton>Send</VoteFeedback.SubmitButton>
</VoteFeedback.Popover>
```

---

## 📊 Automatic Feedback Hooks

### **useFeedbackState Hook**

A **drop-in replacement for React's useState** that automatically tracks state changes.

#### **Basic Usage**

```tsx
const [count, setCount] = useFeedbackState(0, 'counter-widget');
```

#### **Advanced Configuration**

```tsx
const [profile, setProfile] = useFeedbackState(
  { name: '', email: '' },
  state => `profile-${state.email}`, // Dynamic tx_id
  {
    debounceMs: 2000, // Wait time before sending feedback
    diffType: 'object', // Format: 'git' | 'object' | 'json'
    metadata: { component: 'UserProfile' },
    vote: 'upvote', // Static vote or custom function
  }
);
```

#### **Trigger Names for Categorization**

```tsx
const [content, setContent] = useFeedbackState(
  'Initial content',
  'content-editor',
  { default_trigger_name: 'manual_edit' }
);

// Uses default trigger
setContent('User typed this');

// Override with specific trigger
setContent('AI generated this', 'ai_assistance');
setContent('Spell checker fixed this', 'spell_check');
```

### **useFeedbackReducer Hook**

A **drop-in replacement for React's useReducer** with automatic trigger name extraction from action types.

```tsx
const [state, dispatch] = useFeedbackReducer(
  counterReducer,
  { count: 0 },
  'counter-widget'
);

dispatch({ type: 'increment' }); // trigger_name: 'increment'
dispatch({ type: 'reset' }); // trigger_name: 'reset'
dispatch({ type: 'custom' }, 'override'); // Custom trigger name
```

---

## 🎨 Examples

### **Basic Voting Interface**

```tsx
<VoteFeedback.Root onFeedback={feedback => console.log(feedback)}>
  <VoteFeedback.UpvoteButton>👍</VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton>👎</VoteFeedback.DownvoteButton>
</VoteFeedback.Root>
```

### **Styled with Custom CSS**

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

### **Polymorphic Components with asChild**

```tsx
<VoteFeedback.UpvoteButton asChild>
  <button className="custom-button">
    <Icon name="thumbs-up" />
    Like
  </button>
</VoteFeedback.UpvoteButton>
```

### **AI Response Feedback**

```tsx
<VoteFeedback.Root
  tx_id="ai-response-123"
  onFeedback={handleFeedback}
  trigger_name="ai_evaluation"
  extra_metadata={{
    model: 'gpt-4',
    prompt_length: 150,
    response_time: 1200,
  }}
>
  <VoteFeedback.UpvoteButton>👍 Helpful</VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton>👎 Not helpful</VoteFeedback.DownvoteButton>
  <VoteFeedback.Popover>
    <VoteFeedback.Textarea placeholder="How can we improve this response?" />
    <VoteFeedback.SubmitButton>Send feedback</VoteFeedback.SubmitButton>
  </VoteFeedback.Popover>
</VoteFeedback.Root>
```

---

## 📖 API Reference

### **Feedback Data Object**

```typescript
interface FeedbackData {
  tx_id: string; // Unique tracking ID
  vote: 'upvote' | 'downvote'; // User's vote
  explanation?: string; // Optional user comment
  extra_metadata?: Record<string, any>; // Additional context data
  source?: 'IMPLICIT' | 'EXPLICIT'; // How feedback was collected
  correction?: string; // For implicit feedback diffs
  selection?: string; // Selected text context
  trigger_name?: string; // Categorization tag
}
```

### **VoteFeedback.Root Props**

| Prop             | Type                           | Required | Description                         |
| ---------------- | ------------------------------ | -------- | ----------------------------------- |
| `tx_id`          | `string`                       | ✅       | Unique transaction ID for tracking  |
| `onFeedback`     | `(data: FeedbackData) => void` | ✅       | Callback when feedback is submitted |
| `trigger_name`   | `string`                       | ❌       | Optional categorization tag         |
| `extra_metadata` | `object`                       | ❌       | Additional context data             |

### **Hook Options**

#### **useFeedbackState Options**

| Option                 | Type                                 | Default               | Description                   |
| ---------------------- | ------------------------------------ | --------------------- | ----------------------------- |
| `debounceMs`           | `number`                             | `1500`                | Debounce time in milliseconds |
| `diffType`             | `'git' \| 'object' \| 'json'`        | `'git'`               | Diff output format            |
| `compareWith`          | `(a: T, b: T) => boolean`            | `undefined`           | Custom equality function      |
| `metadata`             | `Record<string, any>`                | `{}`                  | Additional metadata           |
| `vote`                 | `'upvote' \| 'downvote' \| function` | `auto`                | Vote determination logic      |
| `default_trigger_name` | `string`                             | `'auto_state_change'` | Default trigger name          |

---

## ♿ Accessibility

✅ **Full keyboard navigation support**  
✅ **ARIA labels and roles**  
✅ **Focus management**  
✅ **Screen reader compatible**  
✅ **High contrast support**  
✅ **Reduced motion respect**

### **Keyboard Shortcuts**

- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` / `Space` - Activate buttons
- `Escape` - Close popover
- `Arrow Keys` - Navigate within popover

---

## 🛠 Development

### **Setup**

```bash
bun install          # Install dependencies
bun dev             # Start Storybook development server
bun run checks       # Run all quality checks
```

### **Testing**

```bash
bun run test:unit           # Run unit tests
bun run test:storybook      # Run Storybook interaction tests
bun run test:storybook:coverage  # Run with coverage
```

### **Building**

```bash
bun build           # Build library for production
bun run typecheck   # TypeScript type checking
bun run lint        # ESLint code quality checks
bun run prettier    # Code formatting
```

### **Quality Checks**

```bash
bun run checks      # Run all quality checks (lint, format, typecheck, tests)
```

---

## ❓ Troubleshooting

### **Common Issues**

#### **Q: Feedback not triggering**

```tsx
// ❌ Missing required props
<VoteFeedback.Root>
    <VoteFeedback.UpvoteButton>👍</VoteFeedback.UpvoteButton>
</VoteFeedback.Root>

// ✅ Include required tx_id and onFeedback
<VoteFeedback.Root
    tx_id="my-feature"
    onFeedback={handleFeedback}
>
    <VoteFeedback.UpvoteButton>👍</VoteFeedback.UpvoteButton>
</VoteFeedback.Root>
```

#### **Q: TypeScript errors with custom components**

```tsx
// ✅ Use asChild for custom components
<VoteFeedback.UpvoteButton asChild>
  <MyCustomButton>Like</MyCustomButton>
</VoteFeedback.UpvoteButton>
```

#### **Q: useFeedbackState not sending feedback**

```tsx
// ✅ Ensure debounce time has passed(the time, not the configuration! :P) and state actually changed
const [value, setValue] = useFeedbackState('initial', 'test', {
  debounceMs: 1000, // Wait 1 second after last change
});
```

#### **Q: Styling not working**

```tsx
// ✅ Components are unstyled by default - add your own CSS or use the Shadcn UI library
<VoteFeedback.UpvoteButton className="bg-green-500 text-white p-2">
  👍 Like
</VoteFeedback.UpvoteButton>
```

### **Best Practices**

✅ **Use unique tx_ids** for each feedback instance - the tx_id should be traceable back to the session's log
and allow us to understand the context of the feedback.
✅ **Handle feedback data asynchronously** in your callback  
✅ **Test keyboard navigation** in your implementation  
✅ **Provide meaningful trigger names** for categorization  
✅ **Include relevant metadata** for context

❌ **Don't use the same tx_id** for multiple components. A tx_id should be traced back to the session's log -
allows us to understand the context of the feedback.

---

## 📚 Additional Resources

**📖 Full Documentation**: [https://feedback-ui.kelet.ai/](https://feedback-ui.kelet.ai/)  
**🎮 Interactive Examples**: [Storybook Documentation](https://feedback-ui.kelet.ai/storybook/)  
**🐛 Report Issues**: [GitHub Issues](https://github.com/kelet-ai/feedback-ui/issues)  
**💬 Discussions**: [GitHub Discussions](https://github.com/kelet-ai/feedback-ui/discussions)

---

## License

**MIT License** - See [LICENSE](LICENSE) file for details.

---

_Built with ❤️ by the [Kelet AI](https://kelet.ai) team_
