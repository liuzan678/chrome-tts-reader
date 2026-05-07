export const DEFAULT_RATE = 1;
export const PREFERENCES_KEY = "reader:preferences";
export const RESUME_KEY_PREFIX = "reader:resume:";

export type ReaderPreferences = {
  rate: number;
  voiceName: string | null;
};

export type ResumeState = {
  currentIndex: number;
  title: string;
  updatedAt: string;
  url: string;
};

export function normalizeUrl(input: string): string {
  try {
    const url = new URL(input);
    url.hash = "";
    return url.toString();
  } catch {
    return input;
  }
}

export function getResumeStorageKey(url: string): string {
  return `${RESUME_KEY_PREFIX}${normalizeUrl(url)}`;
}

export function createDefaultPreferences(): ReaderPreferences {
  return {
    rate: DEFAULT_RATE,
    voiceName: null
  };
}
