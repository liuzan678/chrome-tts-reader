import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { extractReadableContent } from "../../src/content/extractor";

describe("extractReadableContent", () => {
  it("prefers selected text when present", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <article>
            <p>Article paragraph one.</p>
            <p>Article paragraph two.</p>
          </article>
        </body>
      </html>
    `);

    const result = extractReadableContent(dom.window.document, " Selected text ");

    expect(result?.source).toBe("selection");
    expect(result?.paragraphs).toEqual(["Selected text"]);
  });

  it("extracts paragraphs from semantic article containers", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <article>
            <h1>Title</h1>
            <p>Article paragraph one.</p>
            <p>Article paragraph two.</p>
          </article>
        </body>
      </html>
    `);

    const result = extractReadableContent(dom.window.document);

    expect(result?.source).toBe("article");
    expect(result?.paragraphs).toEqual([
      "Title",
      "Article paragraph one.",
      "Article paragraph two."
    ]);
  });

  it("prefers visible docs content over page chrome on docs-style pages", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <main id="main-content" class="vp-page">
            <div class="vp-page-title">
              <h1>JavaGuide</h1>
              <ul class="page-info">
                <li>Author: Guide</li>
                <li>Reading Time: 12 min</li>
              </ul>
            </div>
            <div vp-content>
              <div id="markdown-content">
                <p>Visible paragraph one.</p>
                <p style="display:none">Hidden paragraph should not be read.</p>
                <p>Visible paragraph two.</p>
              </div>
            </div>
          </main>
        </body>
      </html>
    `);

    const result = extractReadableContent(dom.window.document);

    expect(result?.source).toBe("article");
    expect(result?.paragraphs).toEqual([
      "Visible paragraph one.",
      "Visible paragraph two."
    ]);
  });

  it("reads table rows as labeled sentences", () => {
    const dom = new JSDOM(`
      <html>
        <body>
          <article>
            <p>Comparison starts here.</p>
            <table>
              <thead>
                <tr>
                  <th>方式</th>
                  <th>遇到预设外的情况时</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>传统编程</td>
                  <td>报错或走默认分支，需重新开发</td>
                </tr>
                <tr>
                  <td>Workflow</td>
                  <td>走预设兜底路径，无法真正理解情境</td>
                </tr>
              </tbody>
            </table>
            <p>Comparison ends here.</p>
          </article>
        </body>
      </html>
    `);

    const result = extractReadableContent(dom.window.document);

    expect(result?.source).toBe("article");
    expect(result?.paragraphs).toEqual([
      "Comparison starts here.",
      "方式：传统编程；遇到预设外的情况时：报错或走默认分支，需重新开发",
      "方式：Workflow；遇到预设外的情况时：走预设兜底路径，无法真正理解情境",
      "Comparison ends here."
    ]);
  });
});
