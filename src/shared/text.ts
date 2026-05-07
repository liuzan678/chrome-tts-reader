export function normalizeParagraphs(values: string[]): string[] {
  const seen = new Set<string>();
  const paragraphs: string[] = [];

  for (const value of values) {
    const normalized = value.replace(/\s+/g, " ").trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    paragraphs.push(normalized);
  }

  return paragraphs;
}

export function splitTextIntoParagraphs(value: string): string[] {
  return normalizeParagraphs(value.split(/\n{2,}|\r?\n/));
}

export function isMeaningfulParagraph(value: string, minimumLength = 20): boolean {
  return value.replace(/\s+/g, " ").trim().length >= minimumLength;
}
