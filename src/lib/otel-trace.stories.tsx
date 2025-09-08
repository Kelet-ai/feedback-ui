import React, { useState } from 'react';
import { getTraceParent } from '@/lib/otel-trace';
import { context, trace } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { expect, userEvent, within } from 'storybook/test';

export default {
  title: 'lib/otel-trace/getTraceParent',
};

const tracerProvider = new WebTracerProvider();
tracerProvider.register({
  contextManager: new ZoneContextManager(),
});

function TraceParentDemo() {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGet = () => {
    try {
      const tracer = trace.getTracer('storybook-demo');
      const span = tracer.startSpan('traceparent-demo');
      context.with(trace.setSpan(context.active(), span), () => {
        try {
          const v = getTraceParent();
          setValue(v);
          setError(null);
        } catch (e) {
          setValue(null);
          setError(e instanceof Error ? e.message : String(e));
        }
      });
      span.end();
    } catch (e) {
      setValue(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', lineHeight: 1.6 }}>
      <p>
        Click the button to extract a W3C <code>traceparent</code> header from
        the active OpenTelemetry context.
      </p>
      <button
        onClick={handleGet}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: 6,
          background: '#f5f5f5',
          cursor: 'pointer',
        }}
      >
        Get click traceparent
      </button>
      <div style={{ marginTop: 12 }}>
        {value && (
          <div>
            <strong>traceparent:</strong> <code>{value}</code>
          </div>
        )}
        {error && (
          <div style={{ color: '#b00020' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}

export const WithOpenTelemetry = {
  render: () => <TraceParentDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Click the button to generate and extract a traceparent
    const btn = await canvas.findByRole('button', { name: /traceparent/i });
    await userEvent.click(btn);

    // Assert that a valid W3C traceparent is rendered
    const valueEl = await canvas.findByText(
      /^\d{2}-[a-f0-9]{32}-[a-f0-9]{16}-\d{2}$/i
    );
    expect(valueEl).toBeTruthy();
  },
};
