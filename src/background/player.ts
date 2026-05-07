import type {
  ExtractedContent,
  ReaderState,
  VoiceOption
} from "../shared/contracts";
import { DEFAULT_RATE } from "../shared/storage";

export type PlaybackState = ReaderState;

export type PlaybackEvent =
  | { type: "advance" }
  | { type: "rewind" }
  | { type: "set-index"; index: number }
  | { type: "set-status"; status: PlaybackState["status"] }
  | { type: "set-rate"; rate: number }
  | { type: "set-voice"; voiceName: string | null }
  | { type: "set-error"; error: string | null }
  | { type: "set-voices"; availableVoices: VoiceOption[] };

export function createInitialPlaybackState(paragraphs: string[] = []): PlaybackState {
  return {
    activeTabId: null,
    activeUrl: null,
    availableVoices: [],
    currentIndex: 0,
    error: null,
    paragraphs,
    rate: DEFAULT_RATE,
    source: null,
    status: "idle",
    title: "",
    voiceName: null
  };
}

export function loadExtractedContent(
  state: PlaybackState,
  content: ExtractedContent,
  activeTabId: number | null,
  currentIndex = 0
): PlaybackState {
  return {
    ...state,
    activeTabId,
    activeUrl: content.url,
    currentIndex: clampIndex(currentIndex, content.paragraphs.length),
    error: null,
    paragraphs: content.paragraphs,
    source: content.source,
    status: "idle",
    title: content.title
  };
}

export function reducePlaybackState(
  state: PlaybackState,
  event: PlaybackEvent
): PlaybackState {
  if (event.type === "advance") {
    return {
      ...state,
      currentIndex: clampIndex(state.currentIndex + 1, state.paragraphs.length)
    };
  }

  if (event.type === "rewind") {
    return {
      ...state,
      currentIndex: Math.max(state.currentIndex - 1, 0)
    };
  }

  if (event.type === "set-index") {
    return {
      ...state,
      currentIndex: clampIndex(event.index, state.paragraphs.length)
    };
  }

  if (event.type === "set-status") {
    return {
      ...state,
      status: event.status
    };
  }

  if (event.type === "set-rate") {
    return {
      ...state,
      rate: event.rate
    };
  }

  if (event.type === "set-voice") {
    return {
      ...state,
      voiceName: event.voiceName
    };
  }

  if (event.type === "set-error") {
    return {
      ...state,
      error: event.error
    };
  }

  if (event.type === "set-voices") {
    return {
      ...state,
      availableVoices: event.availableVoices
    };
  }

  return state;
}

export function getCurrentParagraph(state: PlaybackState): string | null {
  return state.paragraphs[state.currentIndex] ?? null;
}

function clampIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, total - 1));
}
