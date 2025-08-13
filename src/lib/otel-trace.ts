// Internal function for loading OpenTelemetry API - can be mocked in tests
let _loadOtelApi = (): { trace: any; context: any } => {
  try {
    // Dynamic import - this will throw if @opentelemetry/api is not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@opentelemetry/api');
  } catch {
    throw new Error(
      'OpenTelemetry is not available. Install @opentelemetry/api to use trace ID extraction.'
    );
  }
};

// Test helper to mock the OTEL API loader
export function _setOtelApiLoader(loader: () => { trace: any; context: any }) {
  _loadOtelApi = loader;
}

/**
 * Extracts the current OpenTelemetry trace ID from the active span context.
 *
 * @throws Error if OpenTelemetry is not available or no trace is currently active
 * @returns The trace ID string from the active OTEL span
 *
 * @example
 * ```typescript
 * import { getOtelTraceId } from '@kelet-ai/feedback-ui';
 *
 * // Use as function with VoteFeedback component
 * <VoteFeedback.Root tx_id={getOtelTraceId} onFeedback={handleFeedback}>
 *   <VoteFeedback.UpvoteButton>👍</VoteFeedback.UpvoteButton>
 *   <VoteFeedback.DownvoteButton>👎</VoteFeedback.DownvoteButton>
 * </VoteFeedback.Root>
 * ```
 */
export function getOtelTraceId(): string {
  const { trace, context } = _loadOtelApi();

  try {
    // Method 1: Get span context directly from active context
    const spanContext = trace.getSpanContext(context.active());
    if (spanContext?.traceId) {
      return spanContext.traceId;
    }

    // Method 2: Get from active span
    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
      const spanCtx = activeSpan.spanContext();
      if (spanCtx.traceId) {
        return spanCtx.traceId;
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to extract OpenTelemetry trace ID: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // No trace ID available
  throw new Error(
    'OpenTelemetry trace ID not available. Ensure XHR/Fetch instrumentation is active and a request is in progress.'
  );
}
