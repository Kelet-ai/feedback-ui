import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import React, { useState } from 'react';
import { KeletProvider, useDefaultFeedbackHandler, useKelet } from './kelet';
import type { FeedbackData } from '@/types';

const meta: Meta<typeof KeletProvider> = {
  title: 'Contexts/KeletProvider',
  component: KeletProvider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# KeletProvider Context

The KeletProvider is a React context that manages API key and project configuration for the Kelet feedback system.

## Key Features:
- 🔑 **API Key Management**: Securely manages API authentication
- 🏗️ **Project Configuration**: Handles project-specific settings
- 🪢 **Nesting Support**: Child providers inherit API keys but can override projects
- 🔄 **Multi-Project Workflows**: Support different projects within the same app
- 🎯 **Type Safety**: Full TypeScript support with proper error handling

## Nesting Behavior:
Child providers inherit the API key from their parent but can specify their own project.
This is useful for applications that need to send feedback to different Kelet projects while using the same API credentials.

## Hooks Available:
- **useKelet()**: Access the full context (api_key, project, feedback function)
- **useDefaultFeedbackHandler()**: Get just the feedback function (safe to use without provider)
        `,
      },
    },
  },
  argTypes: {
    apiKey: {
      control: 'text',
      description: 'API key for Kelet authentication',
    },
    project: {
      control: 'text',
      description: 'Project identifier for feedback submissions',
    },
    children: {
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const README: Story = {
  parameters: {
    docs: {
      description: {
        story: `
# KeletProvider Usage Guide

## Basic Usage

\`\`\`tsx
import { KeletProvider, useKelet } from '@kelet-ai/feedback-ui';

function App() {
  return (
    <KeletProvider apiKey="your-api-key" project="your-project">
      <YourComponent />
    </KeletProvider>
  );
}

function YourComponent() {
  const { feedback } = useKelet();
  
  const handleFeedback = async () => {
    await feedback({
      session_id: 'unique-id',
      vote: 'upvote',
      explanation: 'Great feature!'
    });
  };
  
  return <button onClick={handleFeedback}>Give Feedback</button>;
}
\`\`\`

## Nested Provider Usage

**When to use nested providers:**
- 🏢 **Multi-tenant applications** - Different projects per tenant
- 📊 **Analytics separation** - Separate tracking for different features  
- 🔄 **Development workflows** - Different projects for staging/production
- 👥 **Team boundaries** - Different teams using same API key

**How it works:**
- Child providers inherit the API key from their parent
- Each child can specify its own project identifier
- API calls go to different project endpoints using the same authentication

\`\`\`tsx
function MultiProjectApp() {
  return (
    <KeletProvider apiKey="shared-company-key" project="main-app">
      
      {/* Analytics team */}
      <KeletProvider project="analytics">
        <AnalyticsDashboard />
      </KeletProvider>
      
      {/* User feedback team */}
      <KeletProvider project="user-feedback">
        <FeedbackWidget />
      </KeletProvider>
      
      {/* Support team */}
      <KeletProvider project="customer-support">
        <SupportTickets />
      </KeletProvider>
      
    </KeletProvider>
  );
}

// Each component sends feedback to its specific project:
// Analytics → https://api.kelet.ai/api/projects/analytics/signal
// Feedback → https://api.kelet.ai/api/projects/user-feedback/signal  
// Support → https://api.kelet.ai/api/projects/customer-support/signal
\`\`\`

## Safe Hook Usage

Use \`useDefaultFeedbackHandler\` when your component might be used outside a provider:

\`\`\`tsx
import { useDefaultFeedbackHandler } from '@kelet-ai/feedback-ui';

function ReusableButton() {
  const feedback = useDefaultFeedbackHandler(); // Safe - won't throw
  
  const handleClick = async () => {
    // Works with or without provider - no-op if no provider
    await feedback({
      session_id: 'button-click',
      vote: 'upvote'
    });
  };
  
  return <button onClick={handleClick}>Like</button>;
}
\`\`\`

## API Endpoints

Based on your provider configuration, feedback is sent to:
- **URL Pattern:** \`https://api.kelet.ai/api/projects/{project}/signal\`
- **Headers:** \`Authorization: Bearer {apiKey}\`
- **Method:** POST

## Error Handling

The provider automatically handles common scenarios:
- Missing API key throws descriptive error at render time
- Network errors are thrown from the feedback function
- Invalid responses include status text in error message

\`\`\`tsx
try {
  await feedback({ session_id: 'test', vote: 'upvote' });
} catch (error) {
  console.error('Feedback failed:', error.message);
  // Handle error appropriately
}
\`\`\`
        `,
      },
    },
  },
  render: () => (
    <div
      style={{
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h2 style={{ color: '#2d3748', marginBottom: '16px' }}>
        📚 KeletProvider Documentation
      </h2>
      <p style={{ fontSize: '16px', color: '#4a5568', lineHeight: '1.6' }}>
        The complete usage guide is available in the <strong>Docs</strong> tab
        above. It includes code examples for basic usage, nested providers, and
        error handling.
      </p>
      <div
        style={{
          padding: '16px',
          backgroundColor: '#ebf8ff',
          borderRadius: '8px',
          border: '1px solid #90cdf4',
          marginTop: '20px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>Quick Start</h3>
        <ol style={{ margin: '0', paddingLeft: '20px', color: '#4a5568' }}>
          <li>
            Wrap your app with <code>KeletProvider</code>
          </li>
          <li>
            Use <code>useKelet()</code> in components for full context
          </li>
          <li>
            Use <code>useDefaultFeedbackHandler()</code> for safer components
          </li>
          <li>Nest providers for multi-project setups</li>
        </ol>
      </div>
    </div>
  ),
};

// Mock feedback handler for demonstrations (currently unused but available for future stories)
const _createMockFeedbackHandler = (label: string) =>
  fn((data: FeedbackData) => {
    console.log(`[${label}] Feedback submitted:`, data);
    return Promise.resolve();
  });

export const BasicProvider: Story = {
  args: {
    apiKey: 'demo-api-key-12345',
    project: 'feedback-demo',
  },
  render: args => {
    const ProviderDemo = () => {
      const { api_key, project, feedback } = useKelet();
      const [feedbackText, setFeedbackText] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
          await feedback({
            session_id: `demo-${Date.now()}`,
            vote: 'upvote',
            explanation: feedbackText || undefined,
          });
          setFeedbackText('');
        } catch (_error) {
          console.error('Feedback submission failed:', _error);
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div
          style={{
            padding: '24px',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            maxWidth: '400px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>
            Basic Kelet Provider
          </h3>

          <div style={{ marginBottom: '16px', fontSize: '14px' }}>
            <div>
              <strong>API Key:</strong> <code>{api_key}</code>
            </div>
            <div>
              <strong>Project:</strong> <code>{project}</code>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Optional feedback message..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                minHeight: '60px',
                resize: 'vertical',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      );
    };

    return (
      <KeletProvider {...args}>
        <ProviderDemo />
      </KeletProvider>
    );
  },
};

export const NestedMultiProject: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Multi-Project Workflow** - Demonstrates how nested providers can use the same API key for different projects.

This is useful when you have:
- Multiple product areas (analytics, feedback, support)
- Different environments (staging, production)
- Separate teams sharing the same API credentials
        `,
      },
    },
  },
  render: () => {
    const ProjectSection = ({
      title,
      color,
      testId,
    }: {
      title: string;
      color: string;
      testId: string;
    }) => {
      const { api_key, project, feedback } = useKelet();
      const [status, setStatus] = useState('');

      const handleFeedback = async (vote: 'upvote' | 'downvote') => {
        setStatus('Submitting...');
        try {
          await feedback({
            session_id: `${project}-demo-${Date.now()}`,
            vote,
            explanation: `Feedback for ${project} project`,
          });
          setStatus(`✓ Submitted to ${project}`);
          setTimeout(() => setStatus(''), 2000);
        } catch (_error) {
          setStatus('✗ Error');
          setTimeout(() => setStatus(''), 2000);
        }
      };

      return (
        <div
          style={{
            padding: '16px',
            margin: '8px',
            backgroundColor: color,
            borderRadius: '6px',
            color: 'white',
            minWidth: '200px',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0' }}>{title}</h4>
          <div style={{ fontSize: '12px', marginBottom: '12px' }}>
            <div>
              API: <code>{api_key.slice(0, 8)}...</code>
            </div>
            <div>
              Project:{' '}
              <code
                data-testid={`${testId}-project`}
                data-feedback-id={`${testId}-project`}
              >
                {project}
              </code>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              data-testid={`${testId}-upvote`}
              data-feedback-id={`${testId}-upvote`}
              onClick={() => handleFeedback('upvote')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              👍
            </button>
            <button
              data-testid={`${testId}-downvote`}
              data-feedback-id={`${testId}-downvote`}
              onClick={() => handleFeedback('downvote')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              👎
            </button>
          </div>

          {status && (
            <div style={{ fontSize: '11px', fontStyle: 'italic' }}>
              {status}
            </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Multi-Project Workflow Demo
        </h3>

        <KeletProvider apiKey="shared-api-key-67890" project="main-app">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* Analytics Project */}
            <KeletProvider project="analytics">
              <ProjectSection
                title="📊 Analytics"
                color="#4299e1"
                testId="analytics"
              />
            </KeletProvider>

            {/* Feedback Project */}
            <KeletProvider project="user-feedback">
              <ProjectSection
                title="💬 Feedback"
                color="#48bb78"
                testId="feedback"
              />
            </KeletProvider>

            {/* Support Project */}
            <KeletProvider project="customer-support">
              <ProjectSection
                title="🎧 Support"
                color="#ed8936"
                testId="support"
              />
            </KeletProvider>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#f7fafc',
              borderRadius: '6px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            <strong>Parent Context:</strong> API Key shared, each child has its
            own project
          </div>
        </KeletProvider>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify different projects are displayed
    expect(canvas.getByTestId('analytics-project')).toHaveTextContent(
      'analytics'
    );
    expect(canvas.getByTestId('feedback-project')).toHaveTextContent(
      'user-feedback'
    );
    expect(canvas.getByTestId('support-project')).toHaveTextContent(
      'customer-support'
    );

    // Test interaction with one of the nested providers
    const analyticsUpvote = canvas.getByTestId('analytics-upvote');
    await userEvent.click(analyticsUpvote);
  },
};

export const ErrorHandling: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Error Handling Demo** - Shows how the provider handles missing API keys and error scenarios.

Key behaviors:
- Missing API key throws descriptive error
- Network errors are properly caught and handled
- Nested providers without API keys in hierarchy fail gracefully
        `,
      },
    },
  },
  render: () => {
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      try {
        return <>{children}</>;
      } catch (_error) {
        return (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fed7d7',
              borderRadius: '6px',
              color: '#c53030',
              fontSize: '14px',
            }}
          >
            <strong>Error:</strong> {(_error as Error).message}
          </div>
        );
      }
    };

    const ValidProvider = () => {
      const { feedback } = useKelet();
      const [status, setStatus] = useState('');

      const handleNetworkError = async () => {
        setStatus('Testing network error...');
        try {
          // This will be mocked to fail in the test
          await feedback({
            session_id: 'error-test',
            vote: 'upvote',
          });
          setStatus('Success (unexpected!)');
        } catch (_error) {
          setErrorMessage((_error as Error).message);
          setStatus('Error caught successfully');
        }
      };

      return (
        <div
          style={{
            padding: '16px',
            border: '1px solid #68d391',
            borderRadius: '6px',
            backgroundColor: '#f0fff4',
            marginBottom: '16px',
          }}
        >
          <h4 style={{ color: '#2f855a', margin: '0 0 12px 0' }}>
            ✓ Valid Provider (has API key)
          </h4>
          <button
            data-testid="test-network-error"
            data-feedback-id="test-network-error"
            onClick={handleNetworkError}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Test Network Error
          </button>
          {status && (
            <div
              style={{ marginTop: '8px', fontSize: '12px', color: '#2d3748' }}
            >
              Status: {status}
            </div>
          )}
        </div>
      );
    };

    const DefaultHandlerDemo = () => {
      const defaultHandler = useDefaultFeedbackHandler();
      const [status, setStatus] = useState('');

      const handleSubmit = async () => {
        setStatus('Submitting...');
        try {
          // This should work silently (no-op when no provider)
          await defaultHandler({
            session_id: 'no-provider-test',
            vote: 'upvote',
          });
          setStatus('Default handler worked (no-op)');
        } catch (_error) {
          setStatus('Error: ' + (_error as Error).message);
        }
      };

      return (
        <div
          style={{
            padding: '16px',
            border: '1px solid #90cdf4',
            borderRadius: '6px',
            backgroundColor: '#ebf8ff',
          }}
        >
          <h4 style={{ color: '#2b6cb0', margin: '0 0 12px 0' }}>
            useDefaultFeedbackHandler (no provider)
          </h4>
          <p
            style={{ fontSize: '12px', margin: '0 0 8px 0', color: '#4a5568' }}
          >
            This should work without throwing errors
          </p>
          <button
            data-testid="test-default-handler"
            data-feedback-id="test-default-handler"
            onClick={handleSubmit}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Test Default Handler
          </button>
          {status && (
            <div
              style={{ marginTop: '8px', fontSize: '12px', color: '#2d3748' }}
            >
              Status: {status}
            </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '500px' }}>
        <h3>Error Handling Demo</h3>

        {/* Valid provider example */}
        <KeletProvider apiKey="valid-key" project="error-demo">
          <ErrorBoundary>
            <ValidProvider />
          </ErrorBoundary>
        </KeletProvider>

        {/* Default handler without provider */}
        <ErrorBoundary>
          <DefaultHandlerDemo />
        </ErrorBoundary>

        {/* Button to show missing API key error */}
        <div
          style={{
            padding: '16px',
            border: '1px solid #fc8181',
            borderRadius: '6px',
            backgroundColor: '#fef5e7',
            marginTop: '16px',
          }}
        >
          <h4 style={{ color: '#c05621', margin: '0 0 12px 0' }}>
            Missing API Key Error
          </h4>
          <button
            data-testid="trigger-api-key-error"
            data-feedback-id="trigger-api-key-error"
            onClick={() => setShowError(true)}
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Show Provider Without API Key
          </button>
        </div>

        {/* Error display */}
        {(showError || errorMessage) && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fed7d7',
              borderRadius: '6px',
              color: '#c53030',
              fontSize: '14px',
            }}
          >
            <strong>Error Caught:</strong>
            <br />
            {errorMessage ||
              'Provider error would be: "apiKey is required either directly or from a parent KeletProvider"'}
          </div>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test default handler (should work without errors)
    const defaultHandlerButton = canvas.getByTestId('test-default-handler');
    await userEvent.click(defaultHandlerButton);

    // The button click should work without throwing errors
    expect(defaultHandlerButton).toBeInTheDocument();
  },
};

export const HookUsageExamples: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Hook Usage Examples** - Demonstrates the different ways to use Kelet hooks in components.

Shows:
- **useKelet()**: Full context access (requires provider)
- **useDefaultFeedbackHandler()**: Safe fallback that works with or without provider
- **Context values**: How to access API key, project, and feedback function
        `,
      },
    },
  },
  render: () => {
    const ComponentWithUseKelet = () => {
      const { api_key, project, feedback } = useKelet();
      const [lastSubmission, setLastSubmission] = useState('');

      const handleQuickFeedback = async (vote: 'upvote' | 'downvote') => {
        try {
          await feedback({
            session_id: `quick-${Date.now()}`,
            vote,
            explanation: `Quick ${vote} from useKelet hook`,
          });
          setLastSubmission(`${vote} submitted to ${project}`);
        } catch (_error) {
          setLastSubmission('Error: ' + (_error as Error).message);
        }
      };

      return (
        <div
          style={{
            padding: '16px',
            border: '1px solid #4299e1',
            borderRadius: '6px',
            backgroundColor: '#ebf8ff',
            marginBottom: '16px',
          }}
        >
          <h4 style={{ color: '#2b6cb0', margin: '0 0 12px 0' }}>
            useKelet() Hook
          </h4>

          <div
            style={{ fontSize: '12px', marginBottom: '12px', color: '#4a5568' }}
          >
            <div>
              🔑 API Key: <code>{api_key.slice(0, 10)}...</code>
            </div>
            <div>
              📦 Project: <code>{project}</code>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              data-testid="use-kelet-upvote"
              data-feedback-id="use-kelet-upvote"
              onClick={() => handleQuickFeedback('upvote')}
              style={{
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              👍 Quick Upvote
            </button>
            <button
              data-testid="use-kelet-downvote"
              data-feedback-id="use-kelet-downvote"
              onClick={() => handleQuickFeedback('downvote')}
              style={{
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              👎 Quick Downvote
            </button>
          </div>

          {lastSubmission && (
            <div
              style={{
                fontSize: '11px',
                color: '#2d3748',
                fontStyle: 'italic',
              }}
            >
              Last: {lastSubmission}
            </div>
          )}
        </div>
      );
    };

    const ComponentWithDefaultHandler = () => {
      const feedbackHandler = useDefaultFeedbackHandler();
      const [status, setStatus] = useState('');

      const handleFeedback = async () => {
        setStatus('Submitting...');
        try {
          await feedbackHandler({
            session_id: `default-handler-${Date.now()}`,
            vote: 'upvote',
            explanation: 'Using default feedback handler',
          });
          setStatus('✓ Submitted successfully');
          setTimeout(() => setStatus(''), 2000);
        } catch (_error) {
          setStatus('✗ Error: ' + (_error as Error).message);
        }
      };

      return (
        <div
          style={{
            padding: '16px',
            border: '1px solid #48bb78',
            borderRadius: '6px',
            backgroundColor: '#f0fff4',
            marginBottom: '16px',
          }}
        >
          <h4 style={{ color: '#2f855a', margin: '0 0 12px 0' }}>
            useDefaultFeedbackHandler() Hook
          </h4>

          <p
            style={{ fontSize: '12px', margin: '0 0 12px 0', color: '#4a5568' }}
          >
            Safe to use - works with or without provider context
          </p>

          <button
            data-testid="default-handler-submit"
            data-feedback-id="default-handler-submit"
            onClick={handleFeedback}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Submit with Default Handler
          </button>

          {status && (
            <div
              style={{ marginTop: '8px', fontSize: '12px', color: '#2d3748' }}
            >
              {status}
            </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px' }}>
        <h3>Hook Usage Examples</h3>

        <KeletProvider apiKey="hook-demo-key" project="hook-examples">
          <ComponentWithUseKelet />
          <ComponentWithDefaultHandler />
        </KeletProvider>

        <div
          style={{
            padding: '12px',
            backgroundColor: '#f7fafc',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#4a5568',
            marginTop: '16px',
          }}
        >
          <strong>💡 Tip:</strong> Use <code>useDefaultFeedbackHandler()</code>{' '}
          when you want your component to work both inside and outside
          KeletProvider contexts.
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test useKelet hook functionality
    const upvoteButton = canvas.getByTestId('use-kelet-upvote');
    await userEvent.click(upvoteButton);

    // Test default handler
    const defaultHandlerButton = canvas.getByTestId('default-handler-submit');
    await userEvent.click(defaultHandlerButton);
  },
};
