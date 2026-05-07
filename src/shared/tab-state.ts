import type { ReaderState } from "./contracts";
import { normalizeUrl } from "./storage";

export type ActiveTabLike = {
  id?: number;
  url?: string;
};

export function shouldPauseForTabActivation(
  _state: ReaderState,
  _activatedTabId: number
): boolean {
  // Playback stays pinned to the reading tab even when the user browses elsewhere.
  return false;
}

export function shouldLoadActiveTabContent(
  state: ReaderState,
  activeTab: ActiveTabLike | undefined
): boolean {
  if (!activeTab?.id || !activeTab.url) {
    return false;
  }

  if (!state.paragraphs.length || !state.activeUrl) {
    return true;
  }

  if (state.activeTabId !== activeTab.id) {
    return true;
  }

  return normalizeUrl(state.activeUrl) !== normalizeUrl(activeTab.url);
}
