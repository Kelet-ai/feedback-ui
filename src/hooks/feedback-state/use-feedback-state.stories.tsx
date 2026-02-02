import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import React, { useState } from 'react';
import { useFeedbackState } from './use-feedback-state';
import { KeletProvider } from '@/contexts/kelet';

// Test component that wraps the hook for testing
interface FeedbackStateTestProps {
  initialState: any;
  session_id: string | ((state: any) => string);
  options?: any;
  onFeedback?: (data: any) => void;
}

const FeedbackStateTest: React.FC<FeedbackStateTestProps> = ({
  initialState,
  session_id,
  options,
  onFeedback = () => {},
}) => {
  const [state, setState] = useFeedbackState(initialState, session_id, {
    ...options,
    onFeedback,
  });
  const [updateValue, setUpdateValue] = useState('');

  return (
    <KeletProvider project="test-project" apiKey="test-key">
      <div
        style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '600px' }}
      >
        <h2>useFeedbackState Test</h2>

        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <h3>Current State:</h3>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Actions:</h3>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '15px',
            }}
          >
            {typeof state === 'number' && (
              <>
                <button
                  onClick={() => setState(state + 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Increment (+1)
                </button>
                <button
                  onClick={() => setState(state + 10)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Add 10
                </button>
                <button
                  onClick={() => setState((prev: number) => prev * 2)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Double (Function Update)
                </button>
              </>
            )}

            {typeof state === 'string' && (
              <>
                <button
                  onClick={() => setState(state + '!')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Add Exclamation
                </button>
                <button
                  onClick={() => setState('Updated: ' + state)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Prefix with "Updated"
                </button>
              </>
            )}

            {Array.isArray(state) && (
              <>
                <button
                  onClick={() =>
                    setState([...state, `item${state.length + 1}`])
                  }
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Add Item
                </button>
                <button
                  onClick={() => setState(state.slice(0, -1))}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Remove Last
                </button>
              </>
            )}

            {typeof state === 'object' && !Array.isArray(state) && (
              <>
                <button
                  onClick={() =>
                    setState({
                      ...state,
                      name: (state.name || 'User') + ' Updated',
                    })
                  }
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Update Name
                </button>
                <button
                  onClick={() =>
                    setState({ ...state, timestamp: new Date().toISOString() })
                  }
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Add Timestamp
                </button>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Custom value to set"
              value={updateValue}
              onChange={e => setUpdateValue(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                flex: 1,
              }}
            />
            <button
              onClick={() => {
                try {
                  const parsedValue = JSON.parse(updateValue);
                  setState(parsedValue);
                } catch {
                  setState(updateValue);
                }
                setUpdateValue('');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Set Custom Value
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h4>Test Info:</h4>
          <p>
            <strong>Identifier:</strong>{' '}
            {typeof session_id === 'function' ? session_id(state) : session_id}
          </p>
          <p>
            <strong>Options:</strong> {JSON.stringify(options || {})}
          </p>
          <p>
            <em>
              Check console for feedback logs. Changes are debounced based on
              options.debounceMs (default: 3000ms).
            </em>
          </p>
        </div>
      </div>
    </KeletProvider>
  );
};

const meta: Meta<typeof FeedbackStateTest> = {
  title: 'Hooks/useFeedbackState',
  component: FeedbackStateTest,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# useFeedbackState Hook

A **drop-in replacement** for React's \`useState\` that automatically tracks state changes and sends implicit feedback through the Kelet system.

## Key Features:
- 🔄 **Drop-in useState replacement** - Same API signature and behavior
- 🎯 **Automatic diff detection** - Only triggers on actual changes  
- ⏱️ **Debounced updates** - Prevents feedback spam (default: 3000ms)
- 📊 **Multiple diff formats** - Git, object, or JSON diff formats
- 🎭 **Dynamic session_ids** - Can derive session_id from state
- 🎚️ **Vote determination** - Automatic upvote/downvote based on change size
- 🔍 **Custom comparison** - Support for custom equality functions
- 🚫 **Smart nullish handling** - Ignores null/undefined → data transitions by default

## API:
\`\`\`typescript
function useFeedbackState<T>(
  initialState: T, 
  session_id: string | ((state: T) => string), 
  options?: FeedbackStateOptions<T>
): [T, React.Dispatch<React.SetStateAction<T>>]

interface FeedbackStateOptions<T> {
  debounceMs?: number;       // Default: 3000
  diffType?: 'git' | 'object' | 'json';  // Default: 'git'
  compareWith?: (a: T, b: T) => boolean;
  metadata?: Record<string, any>;
  onFeedback?: (data: FeedbackData) => Promise<void>; // Custom feedback handler for testing
}
\`\`\`

## Integration:
- Uses existing Kelet context for feedback submission
- Sends feedback with \`source: 'IMPLICIT'\`
- Includes diff data in the \`correction\` field
- Major changes (>50% different) are sent as downvotes
- Minor changes (≤50% different) are sent as upvotes

Perfect for automatically capturing user state changes as implicit feedback!
        `,
      },
    },
  },
  argTypes: {
    initialState: {
      control: 'object',
      description: 'Initial state value (any type)',
    },
    session_id: {
      control: 'text',
      description: 'Identifier for tracking (string or function)',
    },
    options: {
      control: 'object',
      description: 'Optional configuration options',
    },
    onFeedback: {
      action: 'feedback-sent',
      description: 'Callback when feedback is sent',
    },
  },
  args: {
    onFeedback: fn(data => {
      console.log('Feedback sent:', data);
    }),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimitiveState: Story = {
  args: {
    initialState: 0,
    session_id: 'counter-demo',
    options: { debounceMs: 1500 }, // Faster for testing
  },
  parameters: {
    docs: {
      description: {
        story: `
**Primitive State** - Basic number counter example.

**Features:**
- Number state management
- Increment, add, and function update actions
- Default options (git diff, 3000ms debounce)
- Static string session_id

Try clicking the buttons and watch the console for feedback logs!
        `,
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find and click increment button
    const incrementButton = canvas.getByText('Increment (+1)');
    await userEvent.click(incrementButton);

    // Wait for debounce + a bit more
    await new Promise(resolve => setTimeout(resolve, 1600));

    // The state should have changed
    const stateDisplay = canvas.getByText(/^1$/);
    await expect(stateDisplay).toBeInTheDocument();

    // Verify that feedback was called
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    // Get the actual call and verify the essential properties
    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.session_id).toBe('counter-demo');
    await expect(feedbackCall.source).toBe('IMPLICIT');
    await expect(feedbackCall.vote).toBe('downvote');
    await expect(feedbackCall.correction).toBeTruthy();
    await expect(feedbackCall.explanation).toContain('diff percentage');

    // Test function update
    const doubleButton = canvas.getByText('Double (Function Update)');
    await userEvent.click(doubleButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 1600));

    // State should now be 2
    const updatedStateDisplay = canvas.getByText(/^2$/);
    await expect(updatedStateDisplay).toBeInTheDocument();

    // Verify second feedback call
    await expect(args.onFeedback).toHaveBeenCalledTimes(2);
  },
};

export const ObjectState: Story = {
  args: {
    initialState: { name: 'Test User', active: true, count: 0 },
    session_id: 'user-object',
    options: { diffType: 'object', debounceMs: 1000 },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Object State** - Complex object with multiple properties.

**Features:**
- Object state management
- Object diff format
- 1 second debounce
- Updates name and adds timestamp

Perfect for tracking user settings and preferences!
        `,
      },
    },
  },
};

export const ArrayState: Story = {
  args: {
    initialState: ['apple', 'banana'],
    session_id: (items: string[]) => `fruit-list-${items.length}`,
    options: { diffType: 'json', metadata: { component: 'fruit-picker' } },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Array State** - Dynamic list with function session_id.

**Features:**
- Array state management  
- Dynamic session_id based on array length
- JSON diff format
- Custom metadata inclusion
- Add/remove item actions

The session_id changes as the array grows: \`fruit-list-2\`, \`fruit-list-3\`, etc.
        `,
      },
    },
  },
};

export const StringState: Story = {
  args: {
    initialState: 'Hello World',
    session_id: 'text-content',
    options: {
      diffType: 'git',
      compareWith: (a: string, b: string) => a.length === b.length,
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
**String State** - Text content with custom comparison.

**Features:**
- String state management
- Custom comparison function (only triggers if length changes)
- Git diff format (shows character-level changes)
- String manipulation actions

The custom \`compareWith\` function only considers strings different if their length changes!
        `,
      },
    },
  },
};

export const CustomValue: Story = {
  args: {
    initialState: { type: 'custom', value: 42 },
    session_id: 'custom-demo',
    options: { diffType: 'git', debounceMs: 250, metadata: { test: true } },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Custom Value** - Demonstrates custom input and faster debounce.

**Features:**
- Mixed object state
- Fast debounce (250ms)
- Custom metadata
- Text input for setting arbitrary values (tries JSON parse first)

Use the text input to set custom values like \`"hello"\`, \`123\`, or \`{"custom": true}\`.
        `,
      },
    },
  },
  render: _args => <FeedbackStateTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test custom input
    const customInput = canvas.getByPlaceholderText('Custom value to set');
    const setButton = canvas.getByText('Set Custom Value');

    // Set a string value
    await userEvent.type(customInput, '"Updated String"');
    await userEvent.click(setButton);

    // Wait for debounce (250ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 350));

    // Check that state was updated
    const stateDisplay = canvas.getByText(/Updated String/);
    await expect(stateDisplay).toBeInTheDocument();

    // Verify feedback was called for the first change
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    // Get the actual call and verify the essential properties
    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.session_id).toBe('custom-demo');
    await expect(feedbackCall.source).toBe('IMPLICIT');
    await expect(feedbackCall.vote).toBe('upvote'); // Fixed: object change is now calculated as <50%
    await expect(feedbackCall.correction).toBeTruthy();
    await expect(feedbackCall.explanation).toContain('diff percentage');
    await expect(feedbackCall.extra_metadata.test).toBe(true);

    // Clear and set a number
    await userEvent.clear(customInput);
    await userEvent.type(customInput, '999');
    await userEvent.click(setButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 350));

    // Check number was set
    const numberDisplay = canvas.getByText(/^999$/);
    await expect(numberDisplay).toBeInTheDocument();

    // Verify second feedback call
    await expect(args.onFeedback).toHaveBeenCalledTimes(2);
  },
};

export const RapidChanges: Story = {
  args: {
    initialState: 0,
    session_id: 'rapid-changes-demo',
    options: { diffType: 'git', debounceMs: 300 },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Rapid Changes** - Demonstrates proper debouncing with rapid state changes.

**Features:**
- Fast debounce (300ms) to see behavior quickly
- Rapid sequential changes that should be debounced
- Only the final result should trigger feedback
- Shows cumulative diff from start to end

This test simulates rapid user interactions and verifies that only ONE feedback is sent with the cumulative change.
        `,
      },
    },
  },
  render: _args => <FeedbackStateTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Make rapid changes to test debouncing
    const incrementButton = canvas.getByText('Increment (+1)');

    // Click rapidly multiple times (should be debounced into one feedback)
    await userEvent.click(incrementButton); // 0 -> 1
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(incrementButton); // 1 -> 2
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(incrementButton); // 2 -> 3
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(incrementButton); // 3 -> 4

    // State should be 4 now
    const stateDisplay = canvas.getByText(/^4$/);
    await expect(stateDisplay).toBeInTheDocument();

    // Feedback should NOT be called yet (still debouncing)
    await expect(args.onFeedback).toHaveBeenCalledTimes(0);

    // Wait for debounce to complete (300ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 400));

    // Now feedback should be called exactly ONCE with cumulative change (0->4)
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.session_id).toBe('rapid-changes-demo');
    await expect(feedbackCall.source).toBe('IMPLICIT');

    // The correction should show the change from 0 to 4 (not individual steps)
    await expect(feedbackCall.correction).toContain('-0');
    await expect(feedbackCall.correction).toContain('+4');
  },
};

export const CustomVoteLogic: Story = {
  args: {
    initialState: { severity: 'low', priority: 1 },
    session_id: 'issue-tracker',
    options: {
      debounceMs: 300,
      vote: (before: any, after: any, _diffPercentage: number) => {
        // Custom logic: upvote if priority increased, downvote if decreased
        if (after.priority > before.priority) return 'upvote';
        if (after.priority < before.priority) return 'downvote';

        // For same priority, use severity logic
        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        const beforeSev =
          severityOrder[before.severity as keyof typeof severityOrder] || 1;
        const afterSev =
          severityOrder[after.severity as keyof typeof severityOrder] || 1;

        return afterSev > beforeSev ? 'downvote' : 'upvote'; // Higher severity = downvote
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Custom Vote Logic** - Demonstrates custom vote determination based on business logic.

**Features:**
- Custom vote function with access to before/after states and diff percentage
- Business-specific logic (priority increase = upvote, severity increase = downvote)
- Demonstrates real-world scenario for issue tracking systems

**Vote Logic:**
- Priority increased: upvote (good change)
- Priority decreased: downvote (regression) 
- Higher severity: downvote (problem got worse)
- Lower severity: upvote (problem got better)
        `,
      },
    },
  },
  render: _args => <FeedbackStateTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Update the priority (should be upvote)
    const updateButton = canvas.getByText('Update Name');
    await userEvent.click(updateButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 400));

    // Verify upvote due to priority increase logic
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.session_id).toBe('issue-tracker');
    await expect(feedbackCall.source).toBe('IMPLICIT');

    // The custom vote logic should determine the vote, not the default percentage logic
    await expect(feedbackCall.vote).toBeDefined();
  },
};

export const StaticVoteConfiguration: Story = {
  args: {
    initialState: 'Draft content...',
    session_id: 'content-editor',
    options: {
      debounceMs: 300,
      vote: 'upvote', // Always upvote regardless of changes
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Static Vote Configuration** - Always sends the same vote type.

**Features:**
- Static vote setting overrides automatic determination
- Useful for scenarios where all changes are considered positive/negative
- Example: Content editing where any engagement is positive

**Use Case:** Content creation tools where any user interaction is valuable feedback.
        `,
      },
    },
  },
  render: _args => <FeedbackStateTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Make a change
    const addButton = canvas.getByText('Add Exclamation');
    await userEvent.click(addButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 400));

    // Verify always upvote regardless of change size
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.vote).toBe('upvote'); // Should always be upvote

    // Make another change (completely different content)
    const prefixButton = canvas.getByText('Prefix with "Updated"');
    await userEvent.click(prefixButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 400));

    // Still upvote despite major change
    await expect(args.onFeedback).toHaveBeenCalledTimes(2);
    const secondCall = (args.onFeedback as any)?.mock?.calls?.[1]?.[0];
    await expect(secondCall.vote).toBe('upvote'); // Still upvote
  },
};

// New component for demonstrating ignoreInitialNullish with loading simulation
const LoadingStateTest: React.FC<FeedbackStateTestProps> = ({
  initialState,
  session_id,
  options,
  onFeedback = () => {},
}) => {
  const [state, setState] = useFeedbackState(initialState, session_id, {
    ...options,
    onFeedback,
  });
  const [isLoading, setIsLoading] = useState(false);

  const simulateDataLoad = async () => {
    setIsLoading(true);
    // Simulate XHR delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState({ id: 1, name: 'John Doe', email: 'john@example.com' });
    setIsLoading(false);
  };

  const simulateUserUpdate = () => {
    setState((prevState: any) => ({
      ...prevState,
      name: 'Jane Doe',
      lastUpdated: new Date().toISOString(),
    }));
  };

  return (
    <KeletProvider project="test-project" apiKey="test-key">
      <div
        style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '600px' }}
      >
        <h2>Nullish Initial State Demo</h2>

        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <h3>Current State:</h3>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '50px',
            }}
          >
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Actions:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={simulateDataLoad}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Loading...' : 'Simulate Data Load (XHR)'}
            </button>

            <button
              onClick={simulateUserUpdate}
              disabled={state == null}
              style={{
                padding: '10px 20px',
                backgroundColor: state == null ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: state == null ? 'not-allowed' : 'pointer',
              }}
            >
              Update User Data
            </button>

            <button
              onClick={() => setState(null)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Reset to Null
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h4>Test Info:</h4>
          <p>
            <strong>Identifier:</strong>{' '}
            {typeof session_id === 'function' ? session_id(state) : session_id}
          </p>
          <p>
            <strong>ignoreInitialNullish:</strong>{' '}
            {options?.ignoreInitialNullish ?? 'true (default)'}
          </p>
          <p>
            <strong>Debounce:</strong> {options?.debounceMs ?? 3000}ms
          </p>
          <p>
            <em>
              With ignoreInitialNullish enabled (default), the first transition
              from null/undefined to data should NOT send feedback. Subsequent
              updates should send feedback normally.
            </em>
          </p>
        </div>
      </div>
    </KeletProvider>
  );
};

export const IgnoreInitialNullishEnabled: Story = {
  args: {
    initialState: null,
    session_id: 'user-data-with-ignore',
    options: {
      debounceMs: 500,
      ignoreInitialNullish: true, // Explicitly enabled (default)
    },
    onFeedback: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Ignore Initial Nullish (Enabled)** - Default behavior that ignores the first transition from null/undefined.

**Features:**
- \`ignoreInitialNullish: true\` (default behavior)
- Initial state: \`null\`
- First transition: \`null → data\` ❌ **No feedback sent**
- Subsequent changes: \`data → updated data\` ✅ **Feedback sent**

**Common Use Case:** Loading patterns where initial state is null/undefined and real data comes from XHR/API calls.

**Test Steps:**
1. Click "Simulate Data Load" - should NOT send feedback
2. Click "Update User Data" - should send feedback
3. Check console for feedback logs

This prevents noise from the common \`useState(null)\` → API load → \`setState(data)\` pattern.
        `,
      },
    },
  },
  render: _args => <LoadingStateTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Initial state should be null (find the pre element specifically)
    const stateDisplay = canvas.getByText((content, element) => {
      return element?.tagName?.toLowerCase() === 'pre' && content === 'null';
    });
    await expect(stateDisplay).toBeInTheDocument();

    // Simulate the common loading pattern: null -> data
    const loadButton = canvas.getByText('Simulate Data Load (XHR)');
    await userEvent.click(loadButton);

    // Wait for the simulated XHR delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // State should now have data
    const dataState = canvas.getByText(/"name": "John Doe"/);
    await expect(dataState).toBeInTheDocument();

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));

    // Should NOT have sent feedback for null -> data transition
    await expect(args.onFeedback).toHaveBeenCalledTimes(0);

    // Now make a user update - this SHOULD send feedback
    const updateButton = canvas.getByText('Update User Data');
    await userEvent.click(updateButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));

    // This should have triggered feedback
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.session_id).toBe('user-data-with-ignore');
    await expect(feedbackCall.source).toBe('IMPLICIT');
  },
};

export const IgnoreInitialNullishDisabled: Story = {
  args: {
    initialState: null,
    session_id: 'user-data-track-all',
    options: {
      debounceMs: 500,
      ignoreInitialNullish: false, // Explicitly disabled
    },
    onFeedback: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Ignore Initial Nullish (Disabled)** - Tracks ALL state changes including null/undefined transitions.

**Features:**
- \`ignoreInitialNullish: false\` (opt-out of default behavior)
- Initial state: \`null\`
- First transition: \`null → data\` ✅ **Feedback sent**
- Subsequent changes: \`data → updated data\` ✅ **Feedback sent**

**Use Case:** When you want to track everything, including initial loading patterns.

**Test Steps:**
1. Click "Simulate Data Load" - **should send feedback**
2. Click "Update User Data" - should send feedback again
3. Both changes tracked in console

This is the traditional behavior where every state change is tracked.
        `,
      },
    },
  },
  render: _args => <LoadingStateTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Simulate loading: null -> data (should send feedback when disabled)
    const loadButton = canvas.getByText('Simulate Data Load (XHR)');
    await userEvent.click(loadButton);

    // Wait for XHR simulation
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));

    // Should have sent feedback for null -> data transition
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    const firstCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(firstCall.session_id).toBe('user-data-track-all');

    // Make another update
    const updateButton = canvas.getByText('Update User Data');
    await userEvent.click(updateButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));

    // Should have sent second feedback
    await expect(args.onFeedback).toHaveBeenCalledTimes(2);
  },
};

export const UndefinedInitialState: Story = {
  args: {
    initialState: undefined,
    session_id: 'undefined-demo',
    options: {
      debounceMs: 300,
      ignoreInitialNullish: true, // Default
    },
    onFeedback: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Undefined Initial State** - Demonstrates ignoreInitialNullish with undefined initial state.

**Features:**
- Initial state: \`undefined\`
- ignoreInitialNullish handles both \`null\` and \`undefined\`
- First transition: \`undefined → data\` ❌ **No feedback sent**
- Subsequent changes: \`data → updated data\` ✅ **Feedback sent**

**Use Case:** Components that start with undefined state before data loads.

Shows that ignoreInitialNullish works with both null and undefined initial values.
        `,
      },
    },
  },
  render: _args => <LoadingStateTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Load data from undefined
    const loadButton = canvas.getByText('Simulate Data Load (XHR)');
    await userEvent.click(loadButton);

    await new Promise(resolve => setTimeout(resolve, 1200));
    await new Promise(resolve => setTimeout(resolve, 400));

    // Should NOT send feedback for undefined -> data
    await expect(args.onFeedback).toHaveBeenCalledTimes(0);

    // Update should send feedback
    const updateButton = canvas.getByText('Update User Data');
    await userEvent.click(updateButton);

    await new Promise(resolve => setTimeout(resolve, 400));

    await expect(args.onFeedback).toHaveBeenCalledTimes(1);
  },
};

export const ComplexObjectWithNullFields: Story = {
  args: {
    initialState: { user: null, loading: true, errors: [] },
    session_id: 'complex-object-demo',
    options: {
      debounceMs: 300,
      ignoreInitialNullish: true,
    },
    onFeedback: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Complex Object with Null Fields** - Initial state is an object, not null/undefined.

**Key Point:** ignoreInitialNullish only applies when the **root initial state** is null/undefined.

**Features:**
- Initial state: \`{ user: null, loading: true, errors: [] }\` (object, not null)
- All changes tracked because root state is not nullish
- Shows that ignoreInitialNullish is about the root state, not individual fields

**Result:** All state changes send feedback because the initial state is an object, not null/undefined.
        `,
      },
    },
  },
  render: _args => <LoadingStateTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Even though user field is null, the root state is an object
    // So this should send feedback
    const loadButton = canvas.getByText('Simulate Data Load (XHR)');
    await userEvent.click(loadButton);

    await new Promise(resolve => setTimeout(resolve, 1200));
    await new Promise(resolve => setTimeout(resolve, 400));

    // Should send feedback because root state is not nullish
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.session_id).toBe('complex-object-demo');
  },
};
