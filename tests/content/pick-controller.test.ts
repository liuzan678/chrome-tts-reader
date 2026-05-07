import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import {
  createPickStartController,
  PICK_HINT_TEXT,
  PICK_MODE_CLASS,
  PICK_TARGET_CLASS
} from "../../src/content/pick-controller";
import type { ReadableContentSession } from "../../src/content/session";

describe("createPickStartController", () => {
  it("shows a pick hint when pick mode begins", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <article>
            <p id="first">First paragraph.</p>
          </article>
        </body>
      </html>
    `);
    const first = dom.window.document.getElementById("first");

    if (!first) {
      throw new Error("Expected readable block to exist.");
    }

    const session = createSession([first]);
    const controller = createPickStartController(dom.window.document, session, vi.fn());

    controller.begin();

    expect(dom.window.document.body.textContent).toContain(PICK_HINT_TEXT);
  });

  it("marks readable blocks as selectable when pick mode begins", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <article>
            <p id="first">First paragraph.</p>
            <p id="second">Second paragraph.</p>
          </article>
        </body>
      </html>
    `);
    const first = dom.window.document.getElementById("first");
    const second = dom.window.document.getElementById("second");

    if (!first || !second) {
      throw new Error("Expected readable blocks to exist.");
    }

    const session = createSession([first, second]);
    const controller = createPickStartController(dom.window.document, session, vi.fn());

    controller.begin();

    expect(dom.window.document.documentElement.classList.contains(PICK_MODE_CLASS)).toBe(true);
    expect(first.classList.contains(PICK_TARGET_CLASS)).toBe(true);
    expect(second.classList.contains(PICK_TARGET_CLASS)).toBe(true);
  });

  it("cleans up selectable styles after a successful pick", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <article>
            <p id="first">First paragraph.</p>
            <p id="second"><span id="inner">Second paragraph.</span></p>
          </article>
        </body>
      </html>
    `);
    const first = dom.window.document.getElementById("first");
    const second = dom.window.document.getElementById("second");
    const inner = dom.window.document.getElementById("inner");

    if (!first || !second || !inner) {
      throw new Error("Expected readable blocks to exist.");
    }

    const sendCommand = vi.fn();
    const session = createSession([first, second]);
    const controller = createPickStartController(dom.window.document, session, sendCommand);

    controller.begin();
    inner.dispatchEvent(
      new dom.window.MouseEvent("click", {
        bubbles: true,
        cancelable: true
      })
    );

    expect(sendCommand).toHaveBeenCalledWith({
      type: "reader/start-from-index",
      index: 1
    });
    expect(dom.window.document.documentElement.classList.contains(PICK_MODE_CLASS)).toBe(false);
    expect(first.classList.contains(PICK_TARGET_CLASS)).toBe(false);
    expect(second.classList.contains(PICK_TARGET_CLASS)).toBe(false);
  });

  it("cancels pick mode when escape is pressed", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <article>
            <p id="first">First paragraph.</p>
            <p id="second">Second paragraph.</p>
          </article>
        </body>
      </html>
    `);
    const first = dom.window.document.getElementById("first");
    const second = dom.window.document.getElementById("second");

    if (!first || !second) {
      throw new Error("Expected readable blocks to exist.");
    }

    const sendCommand = vi.fn();
    const session = createSession([first, second]);
    const controller = createPickStartController(dom.window.document, session, sendCommand);

    controller.begin();
    dom.window.document.dispatchEvent(
      new dom.window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true
      })
    );

    expect(sendCommand).not.toHaveBeenCalled();
    expect(dom.window.document.documentElement.classList.contains(PICK_MODE_CLASS)).toBe(false);
    expect(first.classList.contains(PICK_TARGET_CLASS)).toBe(false);
    expect(second.classList.contains(PICK_TARGET_CLASS)).toBe(false);
    expect(dom.window.document.body.textContent).not.toContain(PICK_HINT_TEXT);
  });
});

function createSession(elements: Element[]): ReadableContentSession {
  return {
    getSnapshot: () => ({
      elements,
      paragraphs: elements.map((element) => element.textContent ?? ""),
      source: "article"
    }),
    reset: () => undefined,
    setSnapshot: () => null
  };
}
