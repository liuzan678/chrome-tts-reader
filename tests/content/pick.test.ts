import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { findPickStartIndex } from "../../src/content/pick";

describe("findPickStartIndex", () => {
  it("finds the readable block index for a clicked descendant node", () => {
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

    const secondParagraph = dom.window.document.getElementById("second");
    const inner = dom.window.document.getElementById("inner");

    if (!secondParagraph || !inner) {
      throw new Error("Expected paragraph nodes to exist.");
    }

    expect(findPickStartIndex(inner, [null, secondParagraph])).toBe(1);
  });

  it("ignores clicks on interactive descendants", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <article>
            <p id="paragraph">
              Paragraph text
              <a id="link" href="#jump">Jump</a>
            </p>
          </article>
        </body>
      </html>
    `);

    const paragraph = dom.window.document.getElementById("paragraph");
    const link = dom.window.document.getElementById("link");

    if (!paragraph || !link) {
      throw new Error("Expected paragraph nodes to exist.");
    }

    expect(findPickStartIndex(link, [paragraph])).toBeNull();
  });
});
