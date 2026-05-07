export type PlaybackStatus = "idle" | "playing" | "paused" | "stopped";

export type ReaderSource = "selection" | "article" | "readability" | "fallback";

export type VoiceOption = {
  lang: string;
  name: string;
  remote: boolean;
};

export type ExtractedContent = {
  paragraphs: string[];
  source: ReaderSource;
  title: string;
  url: string;
};

export type ReaderState = {
  activeTabId: number | null;
  activeUrl: string | null;
  availableVoices: VoiceOption[];
  currentIndex: number;
  error: string | null;
  paragraphs: string[];
  rate: number;
  source: ReaderSource | null;
  status: PlaybackStatus;
  title: string;
  voiceName: string | null;
};

export type BackgroundCommand =
  | { type: "reader/get-state" }
  | { type: "reader/load-active-tab" }
  | { type: "reader/play" }
  | { type: "reader/pause" }
  | { type: "reader/pick-start-position" }
  | { type: "reader/start-from-index"; index: number }
  | { type: "reader/stop" }
  | { type: "reader/next" }
  | { type: "reader/previous" }
  | { type: "reader/set-rate"; rate: number }
  | { type: "reader/set-voice"; voiceName: string | null };

export type ContentCommand =
  | { type: "reader-content/extract" }
  | { type: "reader-content/begin-pick-start" }
  | { type: "reader-content/highlight"; index: number }
  | { type: "reader-content/clear-highlight" };

export type RuntimeEvent = {
  state: ReaderState;
  type: "reader/state";
};
