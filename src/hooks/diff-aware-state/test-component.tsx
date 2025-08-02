import React, { useEffect } from 'react';
import { useDiffAwareState } from './use-diff-aware-state';

/**
 * Test component to demonstrate and verify useDiffAwareState hook behavior
 */
export const DiffAwareStateTest: React.FC = () => {
  // Test with primitive value and static identifier
  const [count, setCount] = useDiffAwareState(0, 'counter-test');

  // Test with object value and static identifier
  const [user, setUser] = useDiffAwareState(
    { name: 'Test User', settings: { darkMode: false } },
    'user-test',
    {
      debounceMs: 1500,
      diffType: 'git',
    }
  );

  // Test with array value and dynamic identifier
  const [items, setItems] = useDiffAwareState(
    ['item1', 'item2'],
    items => `items-${items.length}`,
    {
      diffType: 'json',
      metadata: { testKey: 'testValue' },
    }
  );

  // Set up automated test sequence
  useEffect(() => {
    // Test primitive update
    const countTimer = setTimeout(() => {
      console.log('Updating count from 0 to 5');
      setCount(5);
    }, 1000);

    // Test object update
    const userTimer = setTimeout(() => {
      console.log('Updating user object');
      setUser(prev => ({
        ...prev,
        name: 'Updated User',
        settings: {
          ...prev.settings,
          darkMode: true,
        },
      }));
    }, 3000);

    // Test array update
    const itemsTimer = setTimeout(() => {
      console.log('Adding item to array');
      setItems(prev => [...prev, 'item3']);
    }, 5000);

    // Test function update
    const functionTimer = setTimeout(() => {
      console.log('Using function update for count');
      setCount(prev => prev + 10);
    }, 7000);

    return () => {
      clearTimeout(countTimer);
      clearTimeout(userTimer);
      clearTimeout(itemsTimer);
      clearTimeout(functionTimer);
    };
  }, [setCount, setItems, setUser]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>useDiffAwareState Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Primitive Value</h2>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Object Value</h2>
        <p>User: {user.name}</p>
        <p>Dark Mode: {user.settings.darkMode ? 'On' : 'Off'}</p>
        <button
          onClick={() =>
            setUser({
              ...user,
              settings: { ...user.settings, darkMode: !user.settings.darkMode },
            })
          }
        >
          Toggle Dark Mode
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Array Value with Dynamic Identifier</h2>
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <button onClick={() => setItems([...items, `item${items.length + 1}`])}>
          Add Item
        </button>
      </div>

      <p>
        <em>
          Check console for automated test logs. Feedback will be sent to Kelet.
        </em>
      </p>
    </div>
  );
};
