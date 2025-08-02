import React from 'react';
import { DiffAwareStateTest } from './test-component';
import { keletLogger } from './test-kelet-logger';
import { KeletContext } from '@/contexts/kelet';

/**
 * Test runner component that provides a mock Kelet context
 * with our logger to capture feedback
 */
export const DiffAwareStateTestRunner: React.FC = () => {
  // Create a mock Kelet context value
  const mockKeletContext = {
    api_key: 'test-api-key',
    project: 'test-project',
    feedback: keletLogger.logFeedback,
  };

  return (
    <KeletContext.Provider value={mockKeletContext}>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>useDiffAwareState Hook Test Runner</h1>

        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            border: '1px solid #ccc',
          }}
        >
          <button
            onClick={() => keletLogger.clearLogs()}
            style={{ padding: '5px 10px', backgroundColor: '#f0f0f0' }}
          >
            Clear Logs
          </button>
          <p>
            <em>Check the console for feedback logs</em>
          </p>
        </div>

        <DiffAwareStateTest />
      </div>
    </KeletContext.Provider>
  );
};
