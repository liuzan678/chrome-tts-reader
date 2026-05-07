import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import { highlightElement } from "../../src/content/highlight";
import {
  createReadableContentSession,
  installSessionInvalidation
} from "../../src/content/session";

describe("createReadableContentSession", () => {
  it("clears cached snapshot and highlight on pushState navigation", () => {
    const dom = new JSDOM("<html><body><p>Paragraph</p></body></html>", {
      url: "https://example.com/docs/one"
    });
    const paragraph = dom.window.document.querySelector("p");

    if (!paragraph) {
      throw new Error("Expected paragraph to exist.");
    }

    Object.defineProperty(dom.window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn()
    });

    const session = createReadableContentSession(dom.window.document);
    session.setSnapshot({
      elements: [paragraph],
      paragraphs: ["Paragraph"],
      source: "article"
    });

    highlightElement(dom.window.document, paragraph);
    installSessionInvalidation(dom.window, session);

    dom.window.history.pushState({}, "", "/docs/two");

    expect(session.getSnapshot()).toBeNull();
    expect(paragraph.classList.contains("__chrome_tts_reader_active")).toBe(false);
  });

  it("keeps cached snapshot and highlight on hash-only navigation", () => {
    const dom = new JSDOM("<html><body><p>Paragraph</p></body></html>", {
      url: "https://example.com/docs/one"
    });
    const paragraph = dom.window.document.querySelector("p");

    if (!paragraph) {
      throw new Error("Expected paragraph to exist.");
    }

    Object.defineProperty(dom.window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn()
    });

    const session = createReadableContentSession(dom.window.document);
    session.setSnapshot({
      elements: [paragraph],
      paragraphs: ["Paragraph"],
      source: "article"
    });

    highlightElement(dom.window.document, paragraph);
    installSessionInvalidation(dom.window, session);

    dom.window.location.hash = "#section-two";
    dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"));

    expect(session.getSnapshot()).not.toBeNull();
    expect(paragraph.classList.contains("__chrome_tts_reader_active")).toBe(true);
  });
});
