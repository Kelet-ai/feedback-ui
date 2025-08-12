# VoteFeedback Component Implementation Plan

## Overview
Build a headless React component library for thumbs up/down feedback collection with the following architecture:

### Core Architecture
- **Headless Layer**: Compound components providing pure logic and behavior see @airules/headless-ui.mdc
- **Skin Layer**: shadcn/ui styled implementation 
- **Toolchain**: Bun for development (build, test, dev server)

## Implementation Process

### Phase 1: Foundation Setup (Day 1) - ✅ COMPLETED
**Goal**: Set up development environment and basic project structure

### Phase 2: Core Types & Interfaces (Day 1-2) - ✅ COMPLETED
**Goal**: Define TypeScript interfaces and data structures

#### Step 2.1: Core Types
```typescript
// src/types/index.ts
export interface FeedbackData {
  tx_id: string;
  extra_metadata?: Record<string, any>;
  type: 'upvote' | 'downvote';
  explanation?: string;
}

export interface VoteFeedbackRootProps {
  children: ReactNode;
  onFeedback?: (data: FeedbackData) => void | Promise<void>;
  defaultText?: string;
  tx_id: string;
  extra_metadata?: Record<string, any>;
}

// ... other interfaces
```

#### Step 2.2: Component Props Interfaces
- `UpvoteButtonProps`
- `DownvoteButtonProps`
- `PopoverProps`
- `TextareaProps`
- `SubmitButtonProps`

**Deliverables**:
- ✅ All TypeScript interfaces defined
- ✅ Props validation implemented
- ✅ Type exports configured

### Phase 3: Headless Components (Day 2-4) - ✅ COMPLETED
**Goal**: Implement pure headless compound components

#### Step 3.1: Context Implementation
```typescript
// src/components/vote-feedback.tsx
const VoteFeedbackContext = createContext<VoteFeedbackContextValue | null>(null);
const useVoteFeedbackContext = () => { /* ... */ };
```

#### Step 3.2: Root Component
```typescript
const VoteFeedbackRoot = ({ children, onFeedback, defaultText, tx_id, extra_metadata }) => {
  // State management
  // Context provider
  // Return JSX
};
```

#### Step 3.3: Individual Components (Sequential Order)
1. **UpvoteButton** - Simplest component, immediate feedback
2. **DownvoteButton** - Immediate feedback + triggers popover state
3. **Popover** - Container with conditional rendering
4. **Textarea** - Controlled/uncontrolled input handling
5. **SubmitButton** - Final submission logic

#### Step 3.4: Compound Export
```typescript
export const VoteFeedback = {
  Root: VoteFeedbackRoot,
  UpvoteButton,
  DownvoteButton,
  Popover,
  Textarea,
  SubmitButton
};
```

**Deliverables**:
- ✅ Context provider working
- ✅ All compound components implemented
- ✅ Keyboard navigation working
- ✅ ARIA attributes implemented
- ✅ Basic functionality complete

#### Step 5.1: Keyboard Navigation
- Tab order implementation
- Enter/Space activation
- Escape key handling
- Cmd/Ctrl+Enter shortcuts

#### Step 5.2: ARIA Implementation
- Role attributes
- State management (aria-expanded, aria-hidden)
- Label associations
- Live regions for announcements

#### Step 5.3: Focus Management
- Auto-focus on popover open
- Focus restoration on close
- Focus trapping within popover

**Deliverables**:
- ✅ Full keyboard navigation
- ✅ Screen reader compatibility
- ✅ Focus management working
- ✅ Accessibility tests passing

### Phase 6: shadcn Skin Implementation (Day 6-7)
**Goal**: Create beautiful default implementation

#### Step 6.1: shadcn Components Setup
```bash
# Install shadcn dependencies
bun add @radix-ui/react-popover @radix-ui/react-slot
bun add class-variance-authority clsx tailwind-merge lucide-react
```

#### Step 6.2: Base Components
- `src/ui/button.tsx` - shadcn button component
- `src/ui/popover.tsx` - shadcn popover component
- `src/ui/textarea.tsx` - shadcn textarea component
- `src/ui/utils.ts` - cn utility function

#### Step 6.3: Styled Implementation
```typescript
// src/ui/vote-feedback.tsx
export const VoteFeedbackShadcn = ({ className, ...props }) => {
  return (
    <VoteFeedback.Root {...props}>
      {/* shadcn styled components */}
    </VoteFeedback.Root>
  );
};
```

**Deliverables**:
- ✅ shadcn components integrated
- ✅ Styled implementation complete
- ✅ Theme customization working
- ✅ Dark mode support

### Phase 7: Storybook Documentation (Day 7-8) - ✅ COMPLETED
**Goal**: Create comprehensive documentation

#### Step 7.1: Storybook Setup
```bash
# Initialize Storybook
bun run storybook init
```

#### Step 7.2: Story Implementation (Sequential)
1. **Headless Stories** - Basic usage, custom styling, visual testing
2. **Documentation Stories** - API reference, examples
3. **Interactive Testing** - Automated play functions and interactions
4. **Accessibility Testing** - Built-in a11y validation

#### Step 7.3: Interactive Documentation
- Comprehensive stories with play functions
- Multiple variants (basic, custom styling, minimal)
- Automated interaction testing
- Complete workflow demonstration

**Deliverables**:
- ✅ Complete Storybook setup
- ✅ All component stories with interactive testing
- ✅ Comprehensive documentation
- ✅ Accessibility testing integrated

### Phase 8: Integration & Performance (Day 8-9)
**Goal**: Optimize and validate complete system

#### Step 8.1: Performance Optimization
- useCallback implementation
- useMemo for expensive computations
- React.memo for components
- Context optimization

#### Step 8.2: Bundle Optimization
- Tree-shaking verification
- Bundle size analysis
- Dependency audit

#### Step 8.3: Cross-browser Testing
- Modern browser compatibility
- Mobile responsiveness
- Touch interaction support

**Deliverables**:
- ✅ Performance optimized
- ✅ Bundle size acceptable
- ✅ Cross-browser compatible
- ✅ Mobile responsive

## Component Structure

### 1. Headless Compound Components
```typescript
VoteFeedback.Root           // Context provider
VoteFeedback.UpvoteButton   // Thumbs up button
VoteFeedback.DownvoteButton // Thumbs down button  
VoteFeedback.Popover        // Feedback popover container
VoteFeedback.Textarea       // Feedback text input
VoteFeedback.SubmitButton   // Send feedback button
```

### 2. Behavior Flow
1. **Upvote**: Click → immediate callback with upvote data
2. **Downvote**: Click → immediate callback + show popover for optional detailed feedback
3. **Submit**: Send detailed feedback or close popover
4. **Keyboard**: Cmd/Ctrl+Enter to submit, Escape to close

### 3. File Structure
```
src/
├── components/
│   ├── vote-feedback.tsx        # Headless compound components
│   ├── vote-feedback.stories.tsx # Storybook stories
│   └── index.ts
├── ui/
│   ├── vote-feedback.tsx        # shadcn styled skin (future)
│   ├── button.tsx              # shadcn components
│   ├── popover.tsx
│   ├── textarea.tsx
│   └── index.ts
├── types/
│   └── index.ts                # TypeScript interfaces
└── index.ts
```

### 4. Key Features
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Controlled/Uncontrolled**: Support both usage patterns
- **Performance**: useCallback/useMemo optimizations
- **TypeScript**: Comprehensive type definitions

### 5. Development Setup
- **Bun toolchain**: `bun dev`, `bun test`, `bun build`
- **Standard React**: No Bun-specific APIs in library code
- **Universal output**: Works with any bundler/runtime

### 6. Usage Examples
```typescript
// Headless usage
<VoteFeedback.Root tx_id="feedback-123" onFeedback={handleFeedback}>
  <VoteFeedback.UpvoteButton>👍</VoteFeedback.UpvoteButton>
  <VoteFeedback.DownvoteButton>👎</VoteFeedback.DownvoteButton>
  <VoteFeedback.Popover>
    <VoteFeedback.Textarea />
    <VoteFeedback.SubmitButton>Send</VoteFeedback.SubmitButton>
  </VoteFeedback.Popover>
</VoteFeedback.Root>

// With metadata
<VoteFeedback.Root 
  tx_id="feedback-123"
  extra_metadata={{ userId: 'user-456', sessionId: 'session-789' }}
  onFeedback={handleFeedback}
>
  {/* components */}
</VoteFeedback.Root>
```
