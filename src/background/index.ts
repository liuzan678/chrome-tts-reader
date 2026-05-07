import type {
  BackgroundCommand,
  ContentCommand,
  ExtractedContent,
  ReaderState,
  RuntimeEvent,
  VoiceOption
} from "../shared/contracts";
import {
  createDefaultPreferences,
  getResumeStorageKey,
  normalizeUrl,
  PREFERENCES_KEY,
  type ReaderPreferences,
  type ResumeState
} from "../shared/storage";
import {
  shouldLoadActiveTabContent,
  shouldPauseForTabActivation
} from "../shared/tab-state";
import {
  createInitialPlaybackState,
  getCurrentParagraph,
  loadExtractedContent,
  reducePlaybackState
} from "./player";

const SELECTION_MENU_ID = "reader:read-selection";

let state = createInitialPlaybackState();
let speakToken = 0;

type SidePanelApi = {
  setPanelBehavior?: (
    options: {
      openPanelOnActionClick: boolean;
    },
    callback?: () => void
  ) => void;
};

const sidePanelApi = (chrome as typeof chrome & { sidePanel?: SidePanelApi }).sidePanel;

chrome.runtime.onInstalled.addListener(() => {
  void initializeExtension();
});

chrome.runtime.onStartup.addListener(() => {
  void initializeExtension();
});

chrome.runtime.onMessage.addListener((message: BackgroundCommand, sender, sendResponse) => {
  void handleBackgroundCommand(message, sender)
    .then((nextState) => sendResponse(nextState))
    .catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : "Unknown reader error";
      void setError(reason).then((nextState) => sendResponse(nextState));
    });

  return true;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== SELECTION_MENU_ID || !tab?.id || !info.selectionText) {
    return;
  }

  void loadSelectionFromContext(tab, info.selectionText);
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-playback") {
    void togglePlayback();
    return;
  }

  if (command === "next-paragraph") {
    void nextParagraph();
    return;
  }

  if (command === "previous-paragraph") {
    void previousParagraph();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId !== state.activeTabId) {
    return;
  }

  void stopPlayback();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (tabId !== state.activeTabId) {
    return;
  }

  if (changeInfo.status === "loading") {
    void stopPlayback();
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  if (!shouldPauseForTabActivation(state, tabId)) {
    return;
  }

  void pausePlayback();
});

void initializeExtension();

async function initializeExtension(): Promise<void> {
  await ensureSidePanelBehavior();
  await ensureContextMenu();
  await loadPreferences();
  await refreshVoices();
  await broadcastState();
}

async function handleBackgroundCommand(
  message: BackgroundCommand,
  sender: chrome.runtime.MessageSender
): Promise<ReaderState> {
  switch (message.type) {
    case "reader/get-state":
      return state;

    case "reader/load-active-tab":
      return loadActiveTabContent();

    case "reader/play":
      return togglePlayback("play");

    case "reader/pause":
      return pausePlayback();

    case "reader/pick-start-position":
      return beginPickStartPosition();

    case "reader/start-from-index":
      return startFromIndex(message.index, sender);

    case "reader/stop":
      return stopPlayback();

    case "reader/next":
      return nextParagraph();

    case "reader/previous":
      return previousParagraph();

    case "reader/set-rate":
      return updateRate(message.rate);

    case "reader/set-voice":
      return updateVoice(message.voiceName);
  }
}

async function loadActiveTabContent(): Promise<ReaderState> {
  const tab = await getActiveTab();

  if (!tab?.id || !tab.url) {
    return setError("No supported active tab found.");
  }

  const response = await safeSendTabMessage<ExtractedContent | null>(tab.id, {
    type: "reader-content/extract"
  });

  if (!response?.paragraphs.length) {
    state = {
      ...state,
      activeTabId: tab.id,
      activeUrl: tab.url,
      currentIndex: 0,
      error: "No readable text was found on this page.",
      paragraphs: [],
      source: null,
      status: "idle",
      title: tab.title ?? ""
    };
    await clearPageHighlight();
    await broadcastState();
    return state;
  }

  const resume =
    response.source === "selection" ? null : await getResumeState(response.url);

  state = loadExtractedContent(state, response, tab.id, resume?.currentIndex ?? 0);
  await saveResumeState();
  await broadcastState();
  return state;
}

async function loadSelectionFromContext(
  tab: chrome.tabs.Tab,
  selectionText: string
): Promise<ReaderState> {
  const extracted: ExtractedContent = {
    paragraphs: [selectionText.trim()],
    source: "selection",
    title: tab.title ?? "Selected text",
    url: tab.url ?? ""
  };

  state = loadExtractedContent(state, extracted, tab.id ?? null);
  await speakCurrentParagraph();
  return state;
}

async function togglePlayback(mode: "toggle" | "play" = "toggle"): Promise<ReaderState> {
  if (mode === "toggle" && state.status === "playing") {
    return pausePlayback();
  }

  if (state.status === "paused") {
    chrome.tts.resume();
    state = reducePlaybackState(state, {
      type: "set-status",
      status: "playing"
    });
    await syncHighlight();
    await broadcastState();
    return state;
  }

  if (!state.paragraphs.length) {
    await loadActiveTabContent();
  }

  if (!state.paragraphs.length) {
    return state;
  }

  await speakCurrentParagraph();
  return state;
}

async function pausePlayback(): Promise<ReaderState> {
  chrome.tts.pause();
  state = reducePlaybackState(state, {
    type: "set-status",
    status: "paused"
  });
  await saveResumeState();
  await broadcastState();
  return state;
}

async function stopPlayback(): Promise<ReaderState> {
  speakToken += 1;
  chrome.tts.stop();
  state = reducePlaybackState(state, {
    type: "set-status",
    status: "stopped"
  });
  await saveResumeState();
  await clearPageHighlight();
  await broadcastState();
  return state;
}

async function nextParagraph(): Promise<ReaderState> {
  if (!state.paragraphs.length) {
    return state;
  }

  if (state.currentIndex >= state.paragraphs.length - 1) {
    return stopPlayback();
  }

  state = reducePlaybackState(state, { type: "advance" });
  await speakCurrentParagraph();
  return state;
}

async function previousParagraph(): Promise<ReaderState> {
  if (!state.paragraphs.length) {
    return state;
  }

  state = reducePlaybackState(state, { type: "rewind" });
  await speakCurrentParagraph();
  return state;
}

async function updateRate(rate: number): Promise<ReaderState> {
  state = reducePlaybackState(state, {
    type: "set-rate",
    rate: clampRate(rate)
  });
  await savePreferences();

  if (state.status === "playing") {
    await speakCurrentParagraph();
  } else {
    await broadcastState();
  }

  return state;
}

async function updateVoice(voiceName: string | null): Promise<ReaderState> {
  state = reducePlaybackState(state, {
    type: "set-voice",
    voiceName
  });
  await savePreferences();

  if (state.status === "playing") {
    await speakCurrentParagraph();
  } else {
    await broadcastState();
  }

  return state;
}

async function beginPickStartPosition(): Promise<ReaderState> {
  const tab = await getActiveTab();

  if (!tab?.id || !tab.url) {
    return setError("No supported active tab found.");
  }

  if (state.status === "playing") {
    await pausePlayback();
  }

  if (shouldLoadActiveTabContent(state, tab)) {
    await loadActiveTabContent();
  }

  if (!state.paragraphs.length) {
    return state;
  }

  await safeSendTabMessage(tab.id, {
    type: "reader-content/begin-pick-start"
  });
  return state;
}

async function startFromIndex(
  index: number,
  sender: chrome.runtime.MessageSender
): Promise<ReaderState> {
  const tabId = sender.tab?.id ?? null;
  const tabUrl = sender.tab?.url ?? null;

  if (
    tabId === null ||
    !state.paragraphs.length ||
    state.activeTabId !== tabId ||
    !state.activeUrl ||
    !tabUrl ||
    normalizeUrl(state.activeUrl) !== normalizeUrl(tabUrl)
  ) {
    return state;
  }

  state = reducePlaybackState(state, {
    type: "set-index",
    index
  });
  await speakCurrentParagraph();
  return state;
}

async function speakCurrentParagraph(): Promise<void> {
  const paragraph = getCurrentParagraph(state);

  if (!paragraph) {
    await stopPlayback();
    return;
  }

  speakToken += 1;
  const token = speakToken;

  chrome.tts.stop();
  state = reducePlaybackState(state, {
    type: "set-status",
    status: "playing"
  });
  await saveResumeState();
  await syncHighlight();
  await broadcastState();

  chrome.tts.speak(paragraph, {
    rate: state.rate,
    voiceName: state.voiceName ?? undefined,
    onEvent: (event) => {
      if (token !== speakToken) {
        return;
      }

      if (event.type === "end") {
        void handleParagraphEnd(token);
        return;
      }

      if (event.type === "error") {
        const reason = event.errorMessage || "TTS playback failed.";
        void setError(reason);
      }
    }
  });
}

async function handleParagraphEnd(token: number): Promise<void> {
  if (token !== speakToken) {
    return;
  }

  if (state.currentIndex >= state.paragraphs.length - 1) {
    await stopPlayback();
    return;
  }

  state = reducePlaybackState(state, { type: "advance" });
  await speakCurrentParagraph();
}

async function refreshVoices(): Promise<void> {
  const voices = await getVoices();
  const availableVoices: VoiceOption[] = voices.map((voice) => ({
    lang: voice.lang ?? "",
    name: voice.voiceName,
    remote: Boolean(voice.remote)
  }));

  state = reducePlaybackState(state, {
    type: "set-voices",
    availableVoices
  });

  if (
    state.voiceName &&
    !availableVoices.some((voice) => voice.name === state.voiceName)
  ) {
    state = reducePlaybackState(state, {
      type: "set-voice",
      voiceName: null
    });
  }
}

async function loadPreferences(): Promise<void> {
  const defaults = createDefaultPreferences();
  const stored = await storageGetSync<Record<string, ReaderPreferences | undefined>>({
    [PREFERENCES_KEY]: defaults
  });
  const preferences = stored[PREFERENCES_KEY] ?? defaults;

  state = reducePlaybackState(state, {
    type: "set-rate",
    rate: clampRate(preferences.rate)
  });
  state = reducePlaybackState(state, {
    type: "set-voice",
    voiceName: preferences.voiceName ?? null
  });
}

async function savePreferences(): Promise<void> {
  const preferences: ReaderPreferences = {
    rate: state.rate,
    voiceName: state.voiceName
  };

  await storageSetSync({
    [PREFERENCES_KEY]: preferences
  });
}

async function getResumeState(url: string): Promise<ResumeState | null> {
  const key = getResumeStorageKey(url);
  const stored = await storageGetLocal<Record<string, ResumeState | undefined>>({
    [key]: undefined
  });
  return stored[key] ?? null;
}

async function saveResumeState(): Promise<void> {
  if (!state.activeUrl || state.source === "selection" || !state.paragraphs.length) {
    return;
  }

  const key = getResumeStorageKey(state.activeUrl);
  const payload: ResumeState = {
    currentIndex: state.currentIndex,
    title: state.title,
    updatedAt: new Date().toISOString(),
    url: state.activeUrl
  };

  await storageSetLocal({
    [key]: payload
  });
}

async function setError(reason: string): Promise<ReaderState> {
  state = reducePlaybackState(state, {
    type: "set-error",
    error: reason
  });
  state = reducePlaybackState(state, {
    type: "set-status",
    status: "stopped"
  });
  await clearPageHighlight();
  await broadcastState();
  return state;
}

async function syncHighlight(): Promise<void> {
  if (!state.activeTabId || state.source === "selection") {
    return;
  }

  await safeSendTabMessage(state.activeTabId, {
    type: "reader-content/highlight",
    index: state.currentIndex
  });
}

async function clearPageHighlight(): Promise<void> {
  if (!state.activeTabId) {
    return;
  }

  await safeSendTabMessage(state.activeTabId, {
    type: "reader-content/clear-highlight"
  });
}

async function ensureContextMenu(): Promise<void> {
  await new Promise<void>((resolve) => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create(
        {
          contexts: ["selection"],
          id: SELECTION_MENU_ID,
          title: "Read selected text"
        },
        () => {
          void chrome.runtime.lastError;
          resolve();
        }
      );
    });
  });
}

async function ensureSidePanelBehavior(): Promise<void> {
  if (!sidePanelApi?.setPanelBehavior) {
    return;
  }

  await new Promise<void>((resolve) => {
    sidePanelApi.setPanelBehavior?.(
      {
        openPanelOnActionClick: true
      },
      () => {
        void chrome.runtime.lastError;
        resolve();
      }
    );
  });
}

async function broadcastState(): Promise<void> {
  const event: RuntimeEvent = {
    state,
    type: "reader/state"
  };

  await new Promise<void>((resolve) => {
    chrome.runtime.sendMessage(event, () => {
      void chrome.runtime.lastError;
      resolve();
    });
  });
}

function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  return new Promise((resolve) => {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true
      },
      (tabs) => resolve(tabs[0])
    );
  });
}

function safeSendTabMessage<T>(
  tabId: number,
  message: ContentCommand
): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }

      resolve((response as T | undefined) ?? null);
    });
  });
}

function getVoices(): Promise<chrome.tts.TtsVoice[]> {
  return new Promise((resolve) => {
    chrome.tts.getVoices((voices) => resolve(voices ?? []));
  });
}

function storageGetLocal<T>(defaults: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get(defaults, (items) => resolve(items as T));
  });
}

function storageGetSync<T>(defaults: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (items) => resolve(items as T));
  });
}

function storageSetLocal(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, () => resolve());
  });
}

function storageSetSync(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(items, () => resolve());
  });
}

function clampRate(rate: number): number {
  return Math.max(0.5, Math.min(rate, 2));
}
