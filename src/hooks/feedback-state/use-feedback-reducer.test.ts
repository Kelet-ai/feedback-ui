import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFeedbackReducer } from './use-feedback-reducer';

// Simple counter reducer for testing
interface CounterState {
  count: number;
}

type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number }
  | { type: 'add'; payload: number };

function counterReducer(
  state: CounterState,
  action: CounterAction
): CounterState {
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
}

describe('useFeedbackReducer', () => {
  it('should work like React useReducer with basic functionality', () => {
    const { result } = renderHook(() =>
      useFeedbackReducer(counterReducer, { count: 0 }, 'counter')
    );

    expect(result.current[0]).toEqual({ count: 0 });

    act(() => {
      result.current[1]({ type: 'increment' });
    });

    expect(result.current[0]).toEqual({ count: 1 });

    act(() => {
      result.current[1]({ type: 'set', payload: 10 });
    });

    expect(result.current[0]).toEqual({ count: 10 });
  });

  it('should preserve all useReducer functionality', () => {
    const { result } = renderHook(() =>
      useFeedbackReducer(counterReducer, { count: 0 }, 'counter')
    );

    // Should behave like useReducer - state updates work correctly
    expect(result.current[0]).toEqual({ count: 0 });
    expect(typeof result.current[1]).toBe('function');

    act(() => {
      result.current[1]({ type: 'increment' });
    });

    expect(result.current[0]).toEqual({ count: 1 });

    // Should handle functional reducer patterns correctly
    act(() => {
      result.current[1]({ type: 'add', payload: 5 });
    });

    expect(result.current[0]).toEqual({ count: 6 });
  });

  it('should work with initializer function', () => {
    const initializer = (init: CounterState) => ({ count: init.count * 2 });

    const { result } = renderHook(() =>
      useFeedbackReducer(
        counterReducer,
        { count: 5 },
        'counter-with-init',
        undefined,
        initializer
      )
    );

    expect(result.current[0]).toEqual({ count: 10 }); // 5 * 2
  });

  it('should work with complex state objects and dynamic tx_ids', () => {
    interface TodoState {
      todos: { id: number; text: string; completed: boolean }[];
    }

    type TodoAction =
      | { type: 'add_todo'; payload: { text: string } }
      | { type: 'toggle_todo'; payload: { id: number } }
      | { type: 'remove_todo'; payload: { id: number } };

    const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
      switch (action.type) {
        case 'add_todo':
          return {
            todos: [
              ...state.todos,
              {
                id: Date.now(),
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
        default:
          return state;
      }
    };

    const { result } = renderHook(() =>
      useFeedbackReducer(
        todoReducer,
        { todos: [] },
        state => `todos-${state.todos.length}` // Dynamic tx_id
      )
    );

    expect(result.current[0]).toEqual({ todos: [] });

    act(() => {
      result.current[1]({ type: 'add_todo', payload: { text: 'Test todo' } });
    });

    expect(result.current[0].todos).toHaveLength(1);
    expect(result.current[0].todos[0]?.text).toBe('Test todo');
  });
});
