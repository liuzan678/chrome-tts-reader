import type { ContentCommand, ExtractedContent } from "../shared/contracts";
import { extractReadableContent, getSelectedText, type ReadableContent } from "./extractor";
import { clearHighlight, highlightElement } from "./highlight";
import { createPickStartController } from "./pick-controller";
import {
  createReadableContentSession,
  installSessionInvalidation
} from "./session";

const session = createReadableContentSession(document);
const pickStartController = createPickStartController(document, session);

installSessionInvalidation(window, session);

chrome.runtime.onMessage.addListener((message: ContentCommand, _sender, sendResponse) => {
  switch (message.type) {
    case "reader-content/extract": {
      const snapshot = session.setSnapshot(extractReadableContent(document, getSelectedText(document)));
      sendResponse(toExtractedContent(snapshot));
      return;
    }

    case "reader-content/highlight": {
      const element = getOrCreateSnapshot()?.elements[message.index] ?? null;
      highlightElement(document, element);
      sendResponse({ ok: true });
      return;
    }

    case "reader-content/begin-pick-start": {
      getOrCreateSnapshot();
      pickStartController.begin();
      sendResponse({ ok: true });
      return;
    }

    case "reader-content/clear-highlight": {
      clearHighlight(document);
      sendResponse({ ok: true });
      return;
    }

    default:
      return;
  }
});

function toExtractedContent(snapshot: ReadableContent | null): ExtractedContent | null {
  if (!snapshot) {
    return null;
  }

  return {
    paragraphs: snapshot.paragraphs,
    source: snapshot.source,
    title: document.title || location.hostname,
    url: location.href
  };
}

function getOrCreateSnapshot(): ReadableContent | null {
  const existingSnapshot = session.getSnapshot();

  if (existingSnapshot) {
    return existingSnapshot;
  }

  return session.setSnapshot(extractReadableContent(document, getSelectedText(document)));
}
