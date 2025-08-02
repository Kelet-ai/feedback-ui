import type { FeedbackData } from '@/types';

/**
 * Test utility to capture and log feedback sent to Kelet
 * This can be used as a drop-in replacement for useDefaultFeedbackHandler
 * during testing to see the actual data being sent
 */
export function createKeletLogger() {
  const feedbackLogs: FeedbackData[] = [];

  // Log handler that records feedback and returns a promise
  const logFeedback = (data: FeedbackData): Promise<void> => {
    // Clone the data to prevent mutation
    const logData = JSON.parse(JSON.stringify(data));

    // Add timestamp for tracking
    const logEntry = {
      ...logData,
      _timestamp: new Date().toISOString(),
    };

    // Log to console
    console.group('Kelet Feedback Log');
    console.log('Timestamp:', logEntry._timestamp);
    console.log('Identifier:', logEntry.identifier);
    console.log('Source:', logEntry.source);
    console.log('Vote:', logEntry.vote);

    if (logEntry.explanation) {
      console.log('Explanation:', logEntry.explanation);
    }

    if (logEntry.correction) {
      console.log('Correction:');
      console.log(logEntry.correction);
    }

    if (logEntry.extra_metadata) {
      console.log('Metadata:', logEntry.extra_metadata);
    }

    console.groupEnd();

    // Store the log
    feedbackLogs.push(logEntry);

    // Return a resolved promise to simulate the API call
    return Promise.resolve();
  };

  // Function to get all logs
  const getLogs = () => [...feedbackLogs];

  // Function to clear logs
  const clearLogs = () => {
    feedbackLogs.length = 0;
  };

  return {
    logFeedback,
    getLogs,
    clearLogs,
  };
}

// Create a singleton instance for easy access
export const keletLogger = createKeletLogger();
