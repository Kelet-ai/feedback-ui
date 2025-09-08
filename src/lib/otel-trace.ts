// Internal function for loading OpenTelemetry API - can be mocked in tests
const _loadOtelApi = (): { context: any; propagation: any } => {
  const g: any = globalThis;
  const store = g[Symbol.for('opentelemetry.js.api.1')];

  const api = store?.api ?? store;

  if (!api?.context || !api?.propagation) {
    throw new Error(
      '@opentelemetry/api not found. Install it and configure a tracer provider.'
    );
  }
  return api;
};

/**
 * Extracts a W3C traceparent header value from the current active context.
 *
 * Uses the global OpenTelemetry propagation API to inject the active context
 * into a carrier and returns the resulting `traceparent` header string.
 *
 * @throws Error if OpenTelemetry is not available or no active context exists
 * @returns The `traceparent` header string
 *
 * @example
 * ```typescript
 * import { getTraceParent } from '@kelet-ai/feedback-ui';
 *
 * // Use as function with VoteFeedback component
 * <VoteFeedback.Root tx_id={getTraceParent} onFeedback={handleFeedback}>
 *   <VoteFeedback.UpvoteButton>👍</VoteFeedback.UpvoteButton>
 *   <VoteFeedback.DownvoteButton>👎</VoteFeedback.DownvoteButton>
 * </VoteFeedback.Root>
 * ```
 */
export function getTraceParent(_: unknown = null): string {
  try {
    const { context, propagation } = _loadOtelApi();
    const carrier: Record<string, string> = {};

    propagation.inject(context.active(), carrier, {
      set: (c: Record<string, string>, k: string, v: string) => {
        c[k] = v;
      },
    });

    const traceparent = carrier['traceparent'];
    if (!traceparent) {
      throw new Error('traceparent header not available from active context');
    }
    return traceparent;
  } catch (error) {
    throw new Error(
      `Failed to extract traceparent: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
