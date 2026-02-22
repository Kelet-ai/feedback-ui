import React, { createContext, useContext, useEffect } from "react"
import type { FeedbackData } from "@/types"

import { getLatestEvent, initEventCapture } from "@/lib/event-capture"

interface KeletContextValue {
  api_key: string
  project: string
  feedback: (data: FeedbackData) => Promise<void>
}

interface KeletProviderProps {
  apiKey?: string
  project: string
  baseUrl?: string
}

interface FeedbackRequest {
  session_id: string
  source: "IMPLICIT" | "EXPLICIT"
  trigger_name?: string
  vote: "upvote" | "downvote"
  explanation?: string
  selection?: string
  correction?: string
  metadata?: Record<string, any>
}

// Create the context
export const KeletContext = createContext<KeletContextValue | null>(null)

const DefaultKeletBaseUrl = "https://api.kelet.ai"

// Custom hook to use the Kelet context
// noinspection JSUnusedGlobalSymbols
export const useKelet = (): KeletContextValue => {
  const context = useContext(KeletContext)
  if (!context) {
    throw new Error("useKelet must be used within a KeletProvider")
  }
  return context
}

export const useDefaultFeedbackHandler = (): ((
  data: FeedbackData
) => Promise<void>) => {
  const context = useContext(KeletContext)
  if (!context) {
    console.warn(
      "No FeedbackHandler found: defaultFeedbackHandler is not " +
        "possible since there's no KeletProvider wrapping this " +
        "call, and handler not provided"
    )
    return async () => {}
  } else {
    return context.feedback
  }
}

// The KeletProvider component
export const KeletProvider: React.FC<
  React.PropsWithChildren<KeletProviderProps>
> = ({ apiKey, project, baseUrl, children }) => {
  // Initialize event capture once on mount
  useEffect(() => {
    initEventCapture()
  }, [])

  // Get the parent context (if any)
  const parentContext = useContext(KeletContext)

  // Determine the API key to use
  const resolvedApiKey = apiKey || parentContext?.api_key

  if (!resolvedApiKey) {
    throw new Error(
      "apiKey is required either directly or from a parent KeletProvider"
    )
  }

  let resolvedBaseUrl = baseUrl || DefaultKeletBaseUrl
  if (resolvedBaseUrl.endsWith("/api")) {
    resolvedBaseUrl = resolvedBaseUrl.slice(0, -4)
  }
  if (resolvedBaseUrl.endsWith("/")) {
    resolvedBaseUrl = resolvedBaseUrl.slice(0, -1)
  }

  const feedback = async (data: FeedbackData) => {
    const url = `${resolvedBaseUrl}/api/projects/${project}/signal`

    // Snapshot the latest DOM event (if any, and if <10s old)
    const capturedEvent = getLatestEvent()

    // Merge captured event into metadata
    const metadata = {
      ...(data.extra_metadata ?? {}),
      ...(capturedEvent && { $dom_event: capturedEvent }),
    }

    const req: FeedbackRequest = {
      session_id: data.session_id,
      source: data.source || "EXPLICIT",
      vote: data.vote,
      explanation: data.explanation,
      correction: data.correction,
      selection: data.selection,
      trigger_name: data.trigger_name,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resolvedApiKey}`,
      },
      body: JSON.stringify(req),
    })
    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`)
    }
  }

  const value: KeletContextValue = {
    api_key: resolvedApiKey,
    project,
    feedback,
  }

  return <KeletContext.Provider value={value}>{children}</KeletContext.Provider>
}
