import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOtelTraceId, _setOtelApiLoader } from './otel-trace';

describe('getOtelTraceId', () => {
  // Mock the OTEL API
  const mockOtelApi = {
    trace: {
      getSpanContext: vi.fn(),
      getSpan: vi.fn(),
    },
    context: {
      active: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up the mock loader
    _setOtelApiLoader(() => mockOtelApi);
  });

  it('should return trace ID from span context', () => {
    const mockTraceId = '1234567890abcdef1234567890abcdef';
    const mockActiveContext = {};
    const mockSpanContext = { traceId: mockTraceId };

    mockOtelApi.trace.getSpanContext.mockReturnValue(mockSpanContext);
    mockOtelApi.context.active.mockReturnValue(mockActiveContext);

    const result = getOtelTraceId();

    expect(result).toBe(mockTraceId);
    expect(mockOtelApi.context.active).toHaveBeenCalledTimes(1);
    expect(mockOtelApi.trace.getSpanContext).toHaveBeenCalledWith(
      mockActiveContext
    );
  });

  it('should return trace ID from active span when span context method fails', () => {
    const mockTraceId = 'abcdef1234567890abcdef1234567890';
    const mockActiveContext = {};
    const mockSpan = {
      spanContext: vi.fn().mockReturnValue({ traceId: mockTraceId }),
    };

    mockOtelApi.trace.getSpanContext.mockReturnValue(null);
    mockOtelApi.trace.getSpan.mockReturnValue(mockSpan);
    mockOtelApi.context.active.mockReturnValue(mockActiveContext);

    const result = getOtelTraceId();

    expect(result).toBe(mockTraceId);
    expect(mockOtelApi.context.active).toHaveBeenCalledTimes(2);
    expect(mockSpan.spanContext).toHaveBeenCalledTimes(1);
  });

  it('should throw error when no trace ID is available', () => {
    const mockActiveContext = {};

    mockOtelApi.trace.getSpanContext.mockReturnValue(null);
    mockOtelApi.trace.getSpan.mockReturnValue(null);
    mockOtelApi.context.active.mockReturnValue(mockActiveContext);

    expect(() => getOtelTraceId()).toThrow(
      'OpenTelemetry trace ID not available. Ensure XHR/Fetch instrumentation is active and a request is in progress.'
    );
  });

  it('should throw error when OpenTelemetry API is not available', () => {
    // Mock the loader to simulate OTEL not available - the loader should rethrow the expected error
    _setOtelApiLoader(() => {
      try {
        throw new Error('Cannot find module @opentelemetry/api');
      } catch {
        throw new Error(
          'OpenTelemetry is not available. Install @opentelemetry/api to use trace ID extraction.'
        );
      }
    });

    expect(() => getOtelTraceId()).toThrow(
      'OpenTelemetry is not available. Install @opentelemetry/api to use trace ID extraction.'
    );
  });

  it('should handle OpenTelemetry API errors gracefully', () => {
    const errorMessage = 'OTEL API error';
    const mockActiveContext = {};

    mockOtelApi.trace.getSpanContext.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    mockOtelApi.context.active.mockReturnValue(mockActiveContext);

    expect(() => getOtelTraceId()).toThrow(
      `Failed to extract OpenTelemetry trace ID: ${errorMessage}`
    );
  });

  it('should return valid trace ID format', () => {
    const mockTraceId = '12345678901234567890123456789012';
    const mockActiveContext = {};
    const mockSpanContext = { traceId: mockTraceId };

    mockOtelApi.trace.getSpanContext.mockReturnValue(mockSpanContext);
    mockOtelApi.context.active.mockReturnValue(mockActiveContext);

    const result = getOtelTraceId();

    expect(result).toBe(mockTraceId);
    expect(result).toMatch(/^[a-f0-9]{32}$/i);
  });
});
