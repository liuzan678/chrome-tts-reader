import type { ReadableContent } from "./extractor";
import { clearHighlight } from "./highlight";

export type ReadableContentSession = {
  getSnapshot: () => ReadableContent | null;
  reset: () => void;
  setSnapshot: (snapshot: ReadableContent | null) => ReadableContent | null;
};

export function createReadableContentSession(document: Document): ReadableContentSession {
  let snapshot: ReadableContent | null = null;

  return {
    getSnapshot: () => snapshot,
    reset: () => {
      snapshot = null;
      clearHighlight(document);
    },
    setSnapshot: (nextSnapshot) => {
      snapshot = nextSnapshot;
      return snapshot;
    }
  };
}

export function installSessionInvalidation(
  window: Window,
  session: ReadableContentSession
): void {
  let currentUrl = normalizePageUrl(window.location.href);

  const invalidateIfUrlChanged = (): void => {
    const nextUrl = normalizePageUrl(window.location.href);

    if (nextUrl === currentUrl) {
      return;
    }

    currentUrl = nextUrl;
    session.reset();
  };

  installHistoryMethodListener(window, "pushState", invalidateIfUrlChanged);
  installHistoryMethodListener(window, "replaceState", invalidateIfUrlChanged);
  window.addEventListener("popstate", invalidateIfUrlChanged);
  window.addEventListener("hashchange", invalidateIfUrlChanged);
  window.addEventListener("pagehide", () => session.reset());
}

function installHistoryMethodListener(
  window: Window,
  methodName: "pushState" | "replaceState",
  onNavigation: () => void
): void {
  const history = window.history;

  if (methodName === "pushState") {
    const original = history.pushState.bind(history);
    history.pushState = ((...args) => {
      const result = original(...args);
      onNavigation();
      return result;
    }) as History["pushState"];
    return;
  }

  const original = history.replaceState.bind(history);
  history.replaceState = ((...args) => {
    const result = original(...args);
    onNavigation();
    return result;
  }) as History["replaceState"];
}

function normalizePageUrl(input: string): string {
  try {
    const url = new URL(input);
    url.hash = "";
    return url.toString();
  } catch {
    return input;
  }
}
