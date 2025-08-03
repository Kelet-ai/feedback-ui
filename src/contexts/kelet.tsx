import React, { createContext, useContext } from 'react';
import type { FeedbackData } from '@/types';

interface KeletContextValue {
  api_key: string;
  project: string;
  feedback: (data: FeedbackData) => Promise<void>;
}

interface KeletProviderProps {
  apiKey?: string;
  project: string;
}

interface FeedbackRequest {
  tx_id: string;
  source: 'IMPLICIT' | 'EXPLICIT';
  trigger_name?: string;
  vote: 'upvote' | 'downvote';
  explanation?: string;
  selection?: string;
  correction?: string;
}

// Create the context
export const KeletContext = createContext<KeletContextValue | null>(null);

const KeletBaseUrl = 'https://api.kelet.ai/';

// Custom hook to use the Kelet context
// noinspection JSUnusedGlobalSymbols
export const useKelet = (): KeletContextValue => {
  const context = useContext(KeletContext);
  if (!context) {
    throw new Error('useKelet must be used within a KeletProvider');
  }
  return context;
};

export const useDefaultFeedbackHandler = (): ((
  data: FeedbackData
) => Promise<void>) => {
  const context = useContext(KeletContext);
  if (!context) {
    return async () => {};
  } else {
    return context.feedback;
  }
};

// The KeletProvider component
export const KeletProvider: React.FC<
  React.PropsWithChildren<KeletProviderProps>
> = ({ apiKey, project, children }) => {
  // Get the parent context (if any)
  const parentContext = useContext(KeletContext);

  // Determine the API key to use
  const resolvedApiKey = apiKey || parentContext?.api_key;

  if (!resolvedApiKey) {
    throw new Error(
      'apiKey is required either directly or from a parent KeletProvider'
    );
  }

  const feedback = async (data: FeedbackData) => {
    const url = `${KeletBaseUrl}/projects/${project}/feedback`;
    const req: FeedbackRequest = {
      tx_id: data.identifier,
      source: data.source || 'EXPLICIT',
      vote: data.vote,
      explanation: data.explanation,
      correction: data.correction,
      selection: data.selection,
      // Include trigger_name if needed in the future
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resolvedApiKey}`,
      },
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }
  };

  const value: KeletContextValue = {
    api_key: resolvedApiKey,
    project,
    feedback,
  };

  return (
    <KeletContext.Provider value={value}>{children}</KeletContext.Provider>
  );
};
