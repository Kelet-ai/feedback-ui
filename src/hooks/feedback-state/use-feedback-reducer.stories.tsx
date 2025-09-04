import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import React, { useState } from 'react';
import { useFeedbackReducer } from './use-feedback-reducer';
import { KeletProvider } from '@/contexts/kelet';

// Test component that wraps the hook for testing
interface FeedbackReducerTestProps {
  reducer: (state: any, action: any) => any;
  initialState: any;
  tx_id: string | ((state: any) => string);
  options?: any;
  onFeedback?: (data: any) => void;
  initializer?: (init: any) => any;
}

const FeedbackReducerTest: React.FC<FeedbackReducerTestProps> = ({
  reducer,
  initialState,
  tx_id,
  options,
  onFeedback = () => {},
  initializer,
}) => {
  const [state, dispatch] = useFeedbackReducer(
    reducer,
    initialState,
    tx_id,
    {
      ...options,
      onFeedback,
    },
    initializer
  );
  const [customAction, setCustomAction] = useState('');

  return (
    <KeletProvider project="test-project" apiKey="test-key">
      <div
        style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '600px' }}
      >
        <h2>useFeedbackReducer Test</h2>

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
            {/* Counter actions */}
            {typeof state === 'object' && 'count' in state && (
              <>
                <button
                  onClick={() => dispatch({ type: 'increment' })}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Increment
                </button>
                <button
                  onClick={() => dispatch({ type: 'decrement' })}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Decrement
                </button>
                <button
                  onClick={() => dispatch({ type: 'add', payload: 5 })}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Add 5
                </button>
                <button
                  onClick={() => dispatch({ type: 'set', payload: 0 })}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Reset to 0
                </button>
              </>
            )}

            {/* Todo actions */}
            {typeof state === 'object' && 'todos' in state && (
              <>
                <button
                  onClick={() =>
                    dispatch({
                      type: 'add_todo',
                      payload: { text: `Todo ${Date.now()}` },
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
                  Add Todo
                </button>
                {state.todos.length > 0 && (
                  <>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'toggle_todo',
                          payload: { id: state.todos[0].id },
                        })
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
                      Toggle First Todo
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'remove_todo',
                          payload: {
                            id: state.todos[state.todos.length - 1].id,
                          },
                        })
                      }
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove Last Todo
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Custom action (JSON)"
              value={customAction}
              onChange={e => setCustomAction(e.target.value)}
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
                  const action = JSON.parse(customAction);
                  dispatch(action);
                  setCustomAction('');
                } catch {
                  alert('Invalid JSON action');
                }
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
              Dispatch Custom Action
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
            {typeof tx_id === 'function' ? tx_id(state) : tx_id}
          </p>
          <p>
            <strong>Options:</strong> {JSON.stringify(options || {})}
          </p>
          <p>
            <em>
              Check console for feedback logs. Changes are debounced based on
              options.debounceMs (default: 3000ms). Trigger names are
              automatically extracted from action.type.
            </em>
          </p>
        </div>
      </div>
    </KeletProvider>
  );
};

// Counter reducer
interface CounterState {
  count: number;
}

type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number }
  | { type: 'add'; payload: number };

const counterReducer = (
  state: CounterState,
  action: CounterAction
): CounterState => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'set':
      return { count: action.payload };
    case 'add':
      return { count: state.count + action.payload };
    default:
      return state;
  }
};

// Todo reducer
interface TodoState {
  todos: { id: number; text: string; completed: boolean }[];
}

type TodoAction =
  | { type: 'add_todo'; payload: { text: string } }
  | { type: 'toggle_todo'; payload: { id: number } }
  | { type: 'remove_todo'; payload: { id: number } }
  | { type: 'clear_all' };

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'add_todo':
      return {
        todos: [
          ...state.todos,
          {
            id: Date.now() + Math.random(),
            text: action.payload.text,
            completed: false,
          },
        ],
      };
    case 'toggle_todo':
      return {
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    case 'remove_todo':
      return {
        todos: state.todos.filter(todo => todo.id !== action.payload.id),
      };
    case 'clear_all':
      return { todos: [] };
    default:
      return state;
  }
};

const meta: Meta<typeof FeedbackReducerTest> = {
  title: 'Hooks/useFeedbackReducer',
  component: FeedbackReducerTest,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# useFeedbackReducer Hook

A **drop-in replacement** for React's \`useReducer\` that automatically tracks state changes and sends implicit feedback through the Kelet system.

## Key Features:
- 🔄 **Drop-in useReducer replacement** - Same API signature and behavior
- 🎯 **Automatic trigger name extraction** - Uses action.type as trigger_name automatically
- ⏱️ **Debounced updates** - Prevents feedback spam (default: 3000ms)
- 📊 **Multiple diff formats** - Git, object, or JSON diff formats
- 🎭 **Dynamic tx_ids** - Can derive tx_id from state
- 🎚️ **Vote determination** - Automatic upvote/downvote based on change size
- 🔍 **Custom comparison** - Support for custom equality functions
- 🚫 **Smart nullish handling** - Ignores null/undefined → data transitions by default

## API:
\`\`\`typescript
function useFeedbackReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  tx_id: string | ((state: S) => string),
  options?: FeedbackStateOptions<S>,
  initializer?: (arg: S) => S
): [S, (action: A, trigger_name?: string) => void]

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
- Automatically extracts trigger names from \`action.type\`

Perfect for automatically capturing user interactions as implicit feedback in reducer-based components!
        `,
      },
    },
  },
  argTypes: {
    reducer: {
      control: false,
      description: 'Reducer function - same as React useReducer',
    },
    initialState: {
      control: 'object',
      description: 'Initial state value',
    },
    tx_id: {
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
    initializer: {
      control: false,
      description: 'Optional initializer function',
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

export const CounterExample: Story = {
  args: {
    reducer: counterReducer,
    initialState: { count: 0 },
    tx_id: 'counter-demo',
    options: { debounceMs: 1000 },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Counter Example** - Basic counter with useReducer pattern.

**Features:**
- Counter state management with increment/decrement/add/set actions
- Automatic trigger name extraction from action.type ('increment', 'decrement', etc.)
- Default options (git diff, 1000ms debounce for demo)
- Static string tx_id

Try clicking the buttons and watch the console for feedback logs with extracted trigger names!
        `,
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find and click increment button
    const incrementButton = canvas.getByText('Increment');
    await userEvent.click(incrementButton);

    // Wait for debounce + a bit more
    await new Promise(resolve => setTimeout(resolve, 1100));

    // The state should have changed
    const stateDisplay = canvas.getByText(/"count": 1/);
    await expect(stateDisplay).toBeInTheDocument();

    // Verify that feedback was called
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    // Get the actual call and verify the essential properties
    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.tx_id).toBe('counter-demo');
    await expect(feedbackCall.source).toBe('IMPLICIT');
    await expect(feedbackCall.trigger_name).toBe('increment'); // Extracted from action.type
    await expect(feedbackCall.correction).toBeTruthy();
    await expect(feedbackCall.explanation).toContain('diff percentage');

    // Test another action type
    const addButton = canvas.getByText('Add 5');
    await userEvent.click(addButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 1100));

    // State should now be 6
    const updatedStateDisplay = canvas.getByText(/"count": 6/);
    await expect(updatedStateDisplay).toBeInTheDocument();

    // Verify second feedback call with different trigger
    await expect(args.onFeedback).toHaveBeenCalledTimes(2);
    const secondCall = (args.onFeedback as any)?.mock?.calls?.[1]?.[0];
    await expect(secondCall.trigger_name).toBe('add'); // Different trigger name
  },
};

export const TodoListExample: Story = {
  args: {
    reducer: todoReducer,
    initialState: { todos: [] },
    tx_id: state => `todos-${state.todos.length}`,
    options: { diffType: 'object', debounceMs: 800 },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Todo List Example** - Complex state with dynamic tx_id.

**Features:**
- Todo list state management with add/toggle/remove actions
- Dynamic tx_id based on todos count (\`todos-0\`, \`todos-1\`, etc.)
- Object diff format
- 800ms debounce
- Multiple action types with different trigger names

Perfect for tracking user interactions in complex list-based UIs!
        `,
      },
    },
  },
};

export const TriggerNameExamples: Story = {
  args: {
    reducer: counterReducer,
    initialState: { count: 0 },
    tx_id: 'trigger-demo',
    options: { debounceMs: 500 },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Trigger Name Examples** - Demonstrates automatic trigger extraction.

**Features:**
- Fast debounce (500ms) to see behavior quickly
- Automatic extraction of trigger names from action.type
- Different action types show different trigger names in feedback
- Custom actions via JSON input

Try different actions and observe how trigger names are extracted automatically!
        `,
      },
    },
  },
  render: _args => <FeedbackReducerTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test automatic trigger extraction
    const incrementButton = canvas.getByText('Increment');
    await userEvent.click(incrementButton);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));

    // Verify trigger name extraction
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);
    const firstCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(firstCall.trigger_name).toBe('increment');

    // Test different action type
    const addButton = canvas.getByText('Add 5');
    await userEvent.click(addButton);

    await new Promise(resolve => setTimeout(resolve, 600));

    await expect(args.onFeedback).toHaveBeenCalledTimes(2);
    const secondCall = (args.onFeedback as any)?.mock?.calls?.[1]?.[0];
    await expect(secondCall.trigger_name).toBe('add');

    // Test custom JSON input functionality
    const customInput = canvas.getByPlaceholderText('Custom action (JSON)');
    const dispatchButton = canvas.getByText('Dispatch Custom Action');

    // Use fireEvent.change to set the input value directly (avoids userEvent.type parsing issues)
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(customInput, {
      target: { value: '{"type": "set", "payload": 100}' },
    });

    // Click the dispatch button
    await userEvent.click(dispatchButton);

    await new Promise(resolve => setTimeout(resolve, 600));

    // Verify the state was updated
    const finalStateDisplay = canvas.getByText(/"count": 100/);
    await expect(finalStateDisplay).toBeInTheDocument();

    // Verify third feedback call with custom trigger
    await expect(args.onFeedback).toHaveBeenCalledTimes(3);
    const thirdCall = (args.onFeedback as any)?.mock?.calls?.[2]?.[0];
    await expect(thirdCall.trigger_name).toBe('set');
  },
};

export const RapidActions: Story = {
  args: {
    reducer: counterReducer,
    initialState: { count: 0 },
    tx_id: 'rapid-demo',
    options: { debounceMs: 300 },
  },
  parameters: {
    docs: {
      description: {
        story: `
**Rapid Actions** - Demonstrates proper debouncing with rapid dispatches.

**Features:**
- Fast debounce (300ms) to see behavior quickly
- Rapid sequential actions that should be debounced
- Only the final result should trigger feedback when using same trigger
- Shows cumulative diff from start to end

This test simulates rapid user interactions and verifies that only ONE feedback is sent with the cumulative change.
        `,
      },
    },
  },
  render: _args => <FeedbackReducerTest {..._args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Make rapid actions to test debouncing
    const incrementButton = canvas.getByText('Increment');

    // Click rapidly multiple times (should be debounced into one feedback)
    await userEvent.click(incrementButton); // 0 -> 1
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(incrementButton); // 1 -> 2
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(incrementButton); // 2 -> 3
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(incrementButton); // 3 -> 4

    // State should be 4 now
    const stateDisplay = canvas.getByText(/"count": 4/);
    await expect(stateDisplay).toBeInTheDocument();

    // Feedback should NOT be called yet (still debouncing)
    await expect(args.onFeedback).toHaveBeenCalledTimes(0);

    // Wait for debounce to complete (300ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 400));

    // Now feedback should be called exactly ONCE with cumulative change (0->4)
    await expect(args.onFeedback).toHaveBeenCalledTimes(1);

    const feedbackCall = (args.onFeedback as any)?.mock?.calls?.[0]?.[0];
    await expect(feedbackCall.trigger_name).toBe('increment');

    // The correction should show the change from 0 to 4 (not individual steps)
    await expect(feedbackCall.correction).toContain('"count": 0');
    await expect(feedbackCall.correction).toContain('"count": 4');
  },
};

export const WithInitializer: Story = {
  args: {
    reducer: counterReducer,
    initialState: 5,
    tx_id: 'counter-with-init',
    options: { debounceMs: 500 },
    initializer: (init: number) => ({ count: init * 2 }),
  },
  parameters: {
    docs: {
      description: {
        story: `
**With Initializer** - Demonstrates initializer function support.

**Features:**
- Uses initializer function to transform initial state (5 * 2 = 10)
- Same reducer functionality with transformed initial state
- Shows compatibility with all useReducer features

The initializer function doubles the initial value, so count starts at 10 instead of 5.
        `,
      },
    },
  },
  render: _args => <FeedbackReducerTest {..._args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should start with count: 10 (5 * 2 from initializer)
    const initialStateDisplay = canvas.getByText(/"count": 10/);
    await expect(initialStateDisplay).toBeInTheDocument();
  },
};

// Data loading reducer for demonstrating ignoreInitialNullish
interface DataState {
  data: any;
  loading: boolean;
  error: string | null;
}

type DataAction =
  | { type: 'load_start' }
  | { type: 'load_success'; payload: any }
  | { type: 'load_error'; payload: string }
  | { type: 'update_data'; payload: any }
  | { type: 'reset' };

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'load_start':
      return { ...state, loading: true, error: null };
    case 'load_success':
      return { data: action.payload, loading: false, error: null };
    case 'load_error':
      return { ...state, loading: false, error: action.payload };
    case 'update_data':
      return { ...state, data: action.payload };
    case 'reset':
      return { data: null, loading: false, error: null };
    default:
      return state;
  }
};

export const IgnoreInitialNullishReducer: Story = {
  args: {
    reducer: dataReducer,
    initialState: { data: null, loading: false, error: null },
    tx_id: 'data-loading-reducer',
    options: {
      debounceMs: 500,
      ignoreInitialNullish: false, // Note: root state is object, not null, so this doesn't apply
    },
    onFeedback: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: `
**Data Loading with useReducer** - Shows ignoreInitialNullish behavior with reducers.

**Important Note:** In this example, ignoreInitialNullish doesn't apply because the root initial state is an object \`{ data: null, loading: false, error: null }\`, not null/undefined itself.

**Features:**
- Data loading pattern with useReducer
- Complex state with loading, error, and data fields
- Action types: load_start, load_success, load_error, update_data, reset
- Shows that ignoreInitialNullish only applies to root state being null/undefined

**Key Point:** ignoreInitialNullish is about the **root state** being null/undefined, not individual fields within the state.

Try the actions and see how all state changes are tracked since the root state is an object.
        `,
      },
    },
  },
  render: _args => (
    <KeletProvider project="test-project" apiKey="test-key">
      <div
        style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '600px' }}
      >
        <h2>Data Loading Reducer Demo</h2>

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
              minHeight: '80px',
            }}
          >
            {JSON.stringify(_args.initialState, null, 2)}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Actions:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Load Start
            </button>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Load Success
            </button>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Load Error
            </button>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Reset
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
            <strong>Identifier:</strong> data-loading-reducer
          </p>
          <p>
            <strong>Root State Type:</strong> Object (not null/undefined)
          </p>
          <p>
            <strong>ignoreInitialNullish Effect:</strong> None (doesn't apply to
            object root state)
          </p>
          <p>
            <em>
              Since the root state is an object, all changes will be tracked
              regardless of ignoreInitialNullish setting.
            </em>
          </p>
        </div>
      </div>
    </KeletProvider>
  ),
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);

    // This is just a demo - the buttons aren't actually connected
    // But it shows the pattern and explains the ignoreInitialNullish behavior
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the story rendered correctly
    const heading = canvas.getByText('Data Loading Reducer Demo');
    await expect(heading).toBeInTheDocument();
  },
};
