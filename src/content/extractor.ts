import { Readability } from "@mozilla/readability";
import type { ReaderSource } from "../shared/contracts";
import { isMeaningfulParagraph, splitTextIntoParagraphs } from "../shared/text";

const ARTICLE_SELECTORS = [
  "#markdown-content",
  ".vp-doc",
  ".theme-default-content",
  ".markdown-body",
  ".article-content",
  ".post-content",
  ".entry-content",
  "article",
  '[itemprop="articleBody"]',
  "main",
  '[role="main"]'
];
const BLOCK_SELECTORS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "pre"];
const CONTENT_SELECTORS = [...BLOCK_SELECTORS, "table"].join(", ");

type SnapshotEntry = {
  element: Element | null;
  text: string;
};

export type ReadableContent = {
  elements: Array<Element | null>;
  paragraphs: string[];
  source: ReaderSource;
};

export function extractReadableContent(
  document: Document,
  selectedText?: string
): ReadableContent | null {
  const selection = createSnapshot("selection", [{ element: null, text: selectedText ?? "" }]);
  if (selection) {
    return selection;
  }

  const articleContainer = findArticleContainer(document);
  const articleSnapshot = articleContainer
    ? collectSnapshotFromContainer(articleContainer, "article")
    : null;

  if (articleSnapshot) {
    return articleSnapshot;
  }

  const readabilitySnapshot = collectSnapshotFromReadability(document);
  if (readabilitySnapshot) {
    return readabilitySnapshot;
  }

  return collectSnapshotFromFallback(document);
}

function findArticleContainer(document: Document): Element | null {
  for (const selector of ARTICLE_SELECTORS) {
    const container = document.querySelector(selector);

    if (container) {
      return container;
    }
  }

  return null;
}

export function getSelectedText(document: Document): string {
  return document.defaultView?.getSelection?.()?.toString() ?? "";
}

function collectSnapshotFromContainer(
  container: Element,
  source: ReaderSource
): ReadableContent | null {
  const nodes = Array.from(container.querySelectorAll(CONTENT_SELECTORS)).filter((node) =>
    isProbablyVisible(node)
  );
  return createSnapshot(
    source,
    collectSnapshotEntries(nodes)
  );
}

function collectSnapshotFromReadability(document: Document): ReadableContent | null {
  const clone = document.cloneNode(true) as Document;
  const parsed = new Readability(clone).parse();

  if (!parsed?.textContent) {
    return null;
  }

  return createSnapshot(
    "readability",
    splitTextIntoParagraphs(parsed.textContent).map((text) => ({
      element: null,
      text
    }))
  );
}

function collectSnapshotFromFallback(document: Document): ReadableContent | null {
  const root = document.body;
  if (!root) {
    return null;
  }

  const nodes = Array.from(root.querySelectorAll(CONTENT_SELECTORS)).filter((node) =>
    isProbablyVisible(node)
  );

  return createSnapshot(
    "fallback",
    collectSnapshotEntries(nodes)
  );
}

function collectSnapshotEntries(nodes: Element[]): SnapshotEntry[] {
  return nodes.flatMap((element) => {
    if (element.tagName === "TABLE") {
      return extractTableEntries(element);
    }

    return [
      {
        element,
        text: element.textContent ?? ""
      }
    ];
  });
}

function extractTableEntries(table: Element): SnapshotEntry[] {
  const rows = getDataRows(table);
  const headers = getTableHeaders(table, rows);

  return rows.map((row) => ({
    element: row,
    text: formatTableRow(row, headers)
  }));
}

function getTableHeaders(table: Element, rows: HTMLTableRowElement[]): string[] {
  const tableElement = table as HTMLTableElement;
  const headerRows = tableElement.tHead ? Array.from(tableElement.tHead.rows) : [];

  if (headerRows.length > 0) {
    return getRowCellTexts(headerRows[headerRows.length - 1]);
  }

  if (rows.length > 0 && rowHasOnlyHeaderCells(rows[0])) {
    return getRowCellTexts(rows[0]);
  }

  return [];
}

function getDataRows(table: Element): HTMLTableRowElement[] {
  const tableElement = table as HTMLTableElement;
  const bodyRows = Array.from(tableElement.tBodies).flatMap((body) => Array.from(body.rows));

  if (bodyRows.length > 0) {
    return bodyRows.filter((row) => isProbablyVisible(row));
  }

  const rows = Array.from(tableElement.rows).filter((row) => isProbablyVisible(row));

  if (rows.length > 0 && rowHasOnlyHeaderCells(rows[0])) {
    return rows.slice(1);
  }

  return rows;
}

function formatTableRow(row: HTMLTableRowElement, headers: string[]): string {
  const cells = getRowCellTexts(row);

  if (cells.length === 0) {
    return "";
  }

  if (headers.length === cells.length && headers.every(Boolean)) {
    return cells.map((cell, index) => `${headers[index]}：${cell}`).join("；");
  }

  return cells.join("；");
}

function getRowCellTexts(row: HTMLTableRowElement): string[] {
  return Array.from(row.cells)
    .filter((cell) => isProbablyVisible(cell))
    .map((cell) => cell.textContent?.replace(/\s+/g, " ").trim() ?? "")
    .filter(Boolean);
}

function rowHasOnlyHeaderCells(row: HTMLTableRowElement): boolean {
  return Array.from(row.cells).every((cell) => cell.tagName === "TH");
}

function createSnapshot(
  source: ReaderSource,
  entries: SnapshotEntry[]
): ReadableContent | null {
  const seen = new Set<string>();
  const paragraphs: string[] = [];
  const elements: Array<Element | null> = [];

  for (const entry of entries) {
    const normalized = entry.text.replace(/\s+/g, " ").trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    if (source !== "selection" && source !== "readability" && !isMeaningfulParagraph(normalized, 3)) {
      continue;
    }

    seen.add(normalized);
    paragraphs.push(normalized);
    elements.push(entry.element);
  }

  if (paragraphs.length === 0) {
    return null;
  }

  return {
    elements,
    paragraphs,
    source
  };
}

function isProbablyVisible(node: Element): boolean {
  const window = node.ownerDocument.defaultView;

  if (!window || !(node instanceof window.HTMLElement)) {
    return true;
  }

  const style = window.getComputedStyle(node);
  return style.display !== "none" && style.visibility !== "hidden";
}
