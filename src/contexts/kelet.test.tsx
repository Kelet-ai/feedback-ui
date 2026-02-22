import React from "react"
import type { FeedbackData } from "@/types"
import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { KeletProvider, useDefaultFeedbackHandler, useKelet } from "./kelet"

// Mock fetch globally
const mockFetch = vi.fn()
globalThis.fetch = mockFetch as any

describe("KeletProvider", () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Basic Provider functionality", () => {
    it("should provide context value with API key and project", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="test-api-key" project="test-project">
          {children}
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      expect(result.current.api_key).toBe("test-api-key")
      expect(result.current.project).toBe("test-project")
      expect(typeof result.current.feedback).toBe("function")
    })

    it("should throw error when apiKey is not provided", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      expect(() => {
        renderHook(() => useKelet(), {
          wrapper: ({ children }) => (
            <KeletProvider project="test-project">{children}</KeletProvider>
          ),
        })
      }).toThrow(
        "apiKey is required either directly or from a parent KeletProvider"
      )

      consoleSpy.mockRestore()
    })

    it("should submit feedback with correct API call", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="test-api-key" project="test-project">
          {children}
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      await result.current.feedback({
        session_id: "test-id",
        vote: "upvote",
        explanation: "Great feature!",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.kelet.ai/api/projects/test-project/signal",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: JSON.stringify({
            session_id: "test-id",
            source: "EXPLICIT",
            vote: "upvote",
            explanation: "Great feature!",
          }),
        })
      )
    })

    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Unauthorized",
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="test-api-key" project="test-project">
          {children}
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      await expect(
        result.current.feedback({
          session_id: "test-id",
          vote: "upvote",
        })
      ).rejects.toThrow("Failed to submit feedback: Unauthorized")
    })
  })

  describe("Nested Provider functionality", () => {
    it("should inherit API key from parent provider", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="parent-api-key" project="parent-project">
          <KeletProvider project="child-project">{children}</KeletProvider>
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      expect(result.current.api_key).toBe("parent-api-key")
      expect(result.current.project).toBe("child-project")
    })

    it("should override project but keep parent API key", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="parent-key" project="analytics">
          <KeletProvider project="sample">{children}</KeletProvider>
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      expect(result.current.api_key).toBe("parent-key")
      expect(result.current.project).toBe("sample")

      await result.current.feedback({
        session_id: "nested-test",
        vote: "downvote",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.kelet.ai/api/projects/sample/signal",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer parent-key",
          }),
        })
      )
    })

    it("should support multiple levels of nesting", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="root-key" project="root">
          <KeletProvider project="level1">
            <KeletProvider project="level2">{children}</KeletProvider>
          </KeletProvider>
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      expect(result.current.api_key).toBe("root-key")
      expect(result.current.project).toBe("level2")
    })

    it("should allow child to override API key if provided", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="parent-key" project="parent">
          <KeletProvider apiKey="child-key" project="child">
            {children}
          </KeletProvider>
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      expect(result.current.api_key).toBe("child-key")
      expect(result.current.project).toBe("child")
    })

    it("should throw error when no API key in entire hierarchy", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      expect(() => {
        renderHook(() => useKelet(), {
          wrapper: ({ children }) => (
            <KeletProvider project="parent">
              <KeletProvider project="child">{children}</KeletProvider>
            </KeletProvider>
          ),
        })
      }).toThrow(
        "apiKey is required either directly or from a parent KeletProvider"
      )

      consoleSpy.mockRestore()
    })
  })

  describe("Feedback data handling", () => {
    it("should include all feedback properties in API call", async () => {
      const feedbackData: FeedbackData = {
        session_id: "complex-test",
        vote: "downvote",
        explanation: "Could be better",
        correction: "Try this instead",
        selection: "selected text",
        source: "IMPLICIT",
      }

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="test-key" project="test">
          {children}
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      await result.current.feedback(feedbackData)

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.kelet.ai/api/projects/test/signal",
        expect.objectContaining({
          body: JSON.stringify({
            session_id: "complex-test",
            source: "IMPLICIT",
            vote: "downvote",
            explanation: "Could be better",
            correction: "Try this instead",
            selection: "selected text",
          }),
        })
      )
    })

    it("should default source to EXPLICIT when not provided", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <KeletProvider apiKey="test-key" project="test">
          {children}
        </KeletProvider>
      )

      const { result } = renderHook(() => useKelet(), { wrapper })

      await result.current.feedback({
        session_id: "default-source-test",
        vote: "upvote",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            session_id: "default-source-test",
            source: "EXPLICIT",
            vote: "upvote",
          }),
        })
      )
    })
  })
})

describe("useKelet hook", () => {
  it("should throw error when used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => {
      renderHook(() => useKelet())
    }).toThrow("useKelet must be used within a KeletProvider")

    consoleSpy.mockRestore()
  })

  it("should return context value when used within provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeletProvider apiKey="test-key" project="test-project">
        {children}
      </KeletProvider>
    )

    const { result } = renderHook(() => useKelet(), { wrapper })

    expect(result.current.api_key).toBe("test-key")
    expect(result.current.project).toBe("test-project")
    expect(typeof result.current.feedback).toBe("function")
  })
})

describe("useDefaultFeedbackHandler hook", () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  })

  it("should return empty function when no provider context", async () => {
    const { result } = renderHook(() => useDefaultFeedbackHandler())

    expect(typeof result.current).toBe("function")

    // Should not throw when called
    await expect(
      result.current({
        session_id: "test",
        vote: "upvote",
      })
    ).resolves.not.toThrow()

    // Should not make any API calls
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("should return feedback function when provider context exists", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeletProvider apiKey="test-key" project="test-project">
        {children}
      </KeletProvider>
    )

    const { result } = renderHook(() => useDefaultFeedbackHandler(), {
      wrapper,
    })

    expect(typeof result.current).toBe("function")
  })

  it("should handle feedback submission through default handler", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeletProvider apiKey="test-key" project="test-project">
        {children}
      </KeletProvider>
    )

    const { result } = renderHook(() => useDefaultFeedbackHandler(), {
      wrapper,
    })

    await result.current({
      session_id: "default-handler-test",
      vote: "upvote",
      explanation: "Using default handler",
    })

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.kelet.ai/api/projects/test-project/signal",
      expect.objectContaining({
        body: JSON.stringify({
          session_id: "default-handler-test",
          source: "EXPLICIT",
          vote: "upvote",
          explanation: "Using default handler",
        }),
      })
    )
  })
})
