import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTraceParent } from './otel-trace';

// Helpers to access the OpenTelemetry global store symbol
const OTEL_SYMBOL = Symbol.for('opentelemetry.js.api.1');

describe('getTraceParent (dynamic OTEL loader)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the OTEL global between tests

    (globalThis as any)[OTEL_SYMBOL] = undefined;
  });

  it('returns traceparent from propagation.inject', () => {
    const activeMock = vi.fn();
    const injectMock = vi.fn();

    // Provide a minimal OTEL API on the global store

    (globalThis as any)[OTEL_SYMBOL] = {
      context: { active: activeMock },
      propagation: { inject: injectMock },
    };

    const mockActiveContext = {};
    activeMock.mockReturnValue(mockActiveContext);
    injectMock.mockImplementation(
      (_ctx: unknown, carrier: Record<string, string>) => {
        carrier['traceparent'] =
          '00-12345678901234567890123456789012-1234567890123456-01';
      }
    );

    const result = getTraceParent();
    expect(result).toBe(
      '00-12345678901234567890123456789012-1234567890123456-01'
    );
    expect(result).toMatch(/^\d{2}-[a-f0-9]{32}-[a-f0-9]{16}-\d{2}$/i);
    expect(activeMock).toHaveBeenCalledTimes(1);
    expect(injectMock).toHaveBeenCalledTimes(1);
  });

  it('throws when inject fails', () => {
    const activeMock = vi.fn();
    const injectMock = vi.fn(() => {
      throw new Error('injection error');
    });

    (globalThis as any)[OTEL_SYMBOL] = {
      context: { active: activeMock },
      propagation: { inject: injectMock },
    };
    activeMock.mockReturnValue({});

    expect(() => getTraceParent()).toThrow(
      'Failed to extract traceparent: injection error'
    );
  });

  it('throws when traceparent not set on carrier', () => {
    const activeMock = vi.fn();
    const injectMock = vi.fn();

    (globalThis as any)[OTEL_SYMBOL] = {
      context: { active: activeMock },
      propagation: { inject: injectMock },
    };
    activeMock.mockReturnValue({});
    injectMock.mockImplementation(() => {
      // do nothing
    });

    expect(() => getTraceParent()).toThrow(
      'traceparent header not available from active context'
    );
  });

  it('throws when @opentelemetry/api is not available globally', () => {
    // Ensure no OTEL symbol is defined

    (globalThis as any)[OTEL_SYMBOL] = undefined;

    expect(() => getTraceParent()).toThrow(
      '@opentelemetry/api not found. Install it and configure a tracer provider.'
    );
  });
});
