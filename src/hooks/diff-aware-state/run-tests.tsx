import React from 'react';
import { createRoot } from 'react-dom/client';
import { DiffAwareStateTestRunner } from './test-runner';

/**
 * This file is used to run the tests in a development environment.
 * It renders the test component to the DOM and logs feedback data.
 */

// Create a test container element
const container = document.createElement('div');
document.body.appendChild(container);

// Render the test component
const root = createRoot(container);
root.render(<DiffAwareStateTestRunner />);

console.log('useDiffAwareState test is running...');
console.log(
  'Watch the console for feedback logs as state changes are triggered.'
);
