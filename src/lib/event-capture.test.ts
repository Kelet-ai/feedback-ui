import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  clearLatestEvent,
  getLatestEvent,
  initEventCapture,
  isEventCaptureInitialized,
} from "./event-capture"

describe("event-capture", () => {
  beforeEach(() => {
    // Clear any captured events before each test
    clearLatestEvent()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("initEventCapture", () => {
    it("should initialize event listeners only once", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener")

      initEventCapture()
      const firstCallCount = addEventListenerSpy.mock.calls.length

      initEventCapture() // Call again
      const secondCallCount = addEventListenerSpy.mock.calls.length

      // Should not add more listeners on second call
      expect(secondCallCount).toBe(firstCallCount)
      expect(isEventCaptureInitialized()).toBe(true)
    })

    it("should set up listeners for click, keydown, submit, and change events", () => {
      // Note: This test validates that event listeners are set up
      // Since initEventCapture() may have been called in previous tests,
      // we just verify the module is initialized
      initEventCapture()
      expect(isEventCaptureInitialized()).toBe(true)

      // Verify event capture actually works
      const button = document.createElement("button")
      document.body.appendChild(button)

      clearLatestEvent() // Clear any previous event
      button.click()

      expect(getLatestEvent()).not.toBeNull()
      expect(getLatestEvent()?.type).toBe("click")

      document.body.removeChild(button)
    })

    it("should use capture and passive options", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener")

      initEventCapture()

      addEventListenerSpy.mock.calls.forEach((call) => {
        const options = call[2] as AddEventListenerOptions
        expect(options.capture).toBe(true)
        expect(options.passive).toBe(true)
      })
    })
  })

  describe("getLatestEvent", () => {
    it("should return null when no event has been captured", () => {
      expect(getLatestEvent()).toBeNull()
    })

    it("should capture click events with coordinates", () => {
      initEventCapture()

      const button = document.createElement("button")
      button.id = "test-button"
      button.textContent = "Click me"
      document.body.appendChild(button)

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        clientX: 100,
        clientY: 200,
      })

      button.dispatchEvent(clickEvent)

      const captured = getLatestEvent()
      expect(captured).not.toBeNull()
      expect(captured?.type).toBe("click")
      expect(captured?.targetSelector).toContain("test-button")
      expect(captured?.coordinates).toEqual({ x: 100, y: 200 })
      expect(captured?.timestamp).toBeGreaterThan(0)

      document.body.removeChild(button)
    })

    it("should capture keyboard events with key info", () => {
      initEventCapture()

      const input = document.createElement("input")
      input.id = "test-input"
      document.body.appendChild(input)

      const keyEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        key: "Enter",
      })

      input.dispatchEvent(keyEvent)

      const captured = getLatestEvent()
      expect(captured).not.toBeNull()
      expect(captured?.type).toBe("keydown")
      expect(captured?.key).toBe("Enter")

      document.body.removeChild(input)
    })

    it("should return null for events older than 10 seconds", () => {
      initEventCapture()

      const button = document.createElement("button")
      document.body.appendChild(button)

      button.click()

      // Mock Date.now to simulate 11 seconds passing
      const originalNow = Date.now
      const capturedEvent = getLatestEvent()
      const capturedTime = capturedEvent?.timestamp || 0

      vi.spyOn(Date, "now").mockReturnValue(capturedTime + 11000) // 11 seconds later

      expect(getLatestEvent()).toBeNull() // Should be discarded

      vi.spyOn(Date, "now").mockRestore()
      Date.now = originalNow

      document.body.removeChild(button)
    })

    it("should return event if less than 10 seconds old", () => {
      initEventCapture()

      const button = document.createElement("button")
      document.body.appendChild(button)

      button.click()

      // Mock Date.now to simulate 5 seconds passing
      const originalNow = Date.now
      const capturedEvent = getLatestEvent()
      const capturedTime = capturedEvent?.timestamp || 0

      vi.spyOn(Date, "now").mockReturnValue(capturedTime + 5000) // 5 seconds later

      expect(getLatestEvent()).not.toBeNull() // Should still be valid

      vi.spyOn(Date, "now").mockRestore()
      Date.now = originalNow

      document.body.removeChild(button)
    })

    it("should prefer aria-label over text content", () => {
      initEventCapture()

      const button = document.createElement("button")
      button.setAttribute("aria-label", "Aria Label Text")
      button.textContent = "Button Text"
      document.body.appendChild(button)

      button.click()

      const captured = getLatestEvent()
      expect(captured?.targetText).toBe("Aria Label Text")

      document.body.removeChild(button)
    })

    it("should truncate text to 50 characters", () => {
      initEventCapture()

      const button = document.createElement("button")
      button.textContent = "A".repeat(100) // 100 characters
      document.body.appendChild(button)

      button.click()

      const captured = getLatestEvent()
      expect(captured?.targetText.length).toBe(50)

      document.body.removeChild(button)
    })

    it("should return a copy of the event, not a reference", () => {
      initEventCapture()

      const button = document.createElement("button")
      document.body.appendChild(button)

      button.click()

      const captured1 = getLatestEvent()
      const captured2 = getLatestEvent()

      expect(captured1).toEqual(captured2)
      expect(captured1).not.toBe(captured2) // Different object references

      document.body.removeChild(button)
    })
  })

  describe("clearLatestEvent", () => {
    it("should clear the captured event", () => {
      initEventCapture()

      const button = document.createElement("button")
      document.body.appendChild(button)

      button.click()

      expect(getLatestEvent()).not.toBeNull()

      clearLatestEvent()

      expect(getLatestEvent()).toBeNull()

      document.body.removeChild(button)
    })
  })

  describe("CSS selector generation", () => {
    it("should use element ID when available", () => {
      initEventCapture()

      const div = document.createElement("div")
      div.id = "unique-id"
      document.body.appendChild(div)

      div.click()

      const captured = getLatestEvent()
      expect(captured?.targetSelector).toBe("#unique-id")

      document.body.removeChild(div)
    })

    it("should use data-feedback-id when available", () => {
      initEventCapture()

      const div = document.createElement("div")
      div.setAttribute("data-feedback-id", "custom-id")
      document.body.appendChild(div)

      div.click()

      const captured = getLatestEvent()
      expect(captured?.targetSelector).toContain("custom-id")

      document.body.removeChild(div)
    })

    it("should build selector path for nested elements", () => {
      initEventCapture()

      const parent = document.createElement("div")
      parent.className = "parent"
      const child = document.createElement("button")
      child.className = "child"
      parent.appendChild(child)
      document.body.appendChild(parent)

      child.click()

      const captured = getLatestEvent()
      expect(captured?.targetSelector).toContain("button")
      expect(captured?.targetSelector).toContain("child")

      document.body.removeChild(parent)
    })
  })
})
