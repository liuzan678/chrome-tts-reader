import type {
  BackgroundCommand,
  ReaderState,
  RuntimeEvent,
  VoiceOption
} from "../shared/contracts";
import { shouldLoadActiveTabContent } from "../shared/tab-state";

const STATUS_LABELS: Record<ReaderState["status"], string> = {
  idle: "Ready",
  paused: "Paused",
  playing: "Playing",
  stopped: "Stopped"
};

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <main class="panel">
      <div class="eyebrow">Chrome TTS Reader</div>
      <h1 class="title" id="reader-title">Open any article page to start.</h1>
      <div class="meta">
        <span class="pill" id="reader-status">Ready</span>
        <span class="pill" id="reader-source">Source: —</span>
        <span class="pill" id="reader-progress">Paragraph 0 / 0</span>
      </div>

      <section class="controls">
        <div class="section-title">Controls</div>
        <div class="button-grid">
          <button class="full" id="load-page" type="button">Read Current Page</button>
          <button class="full" id="pick-start" type="button">Pick Start Position</button>
          <button id="play" type="button">Play</button>
          <button id="pause" type="button">Pause</button>
          <button id="stop" type="button">Stop</button>
          <button id="previous" type="button">Previous</button>
          <button id="next" type="button">Next</button>
        </div>
      </section>

      <section class="settings">
        <div class="section-title">Voice</div>
        <label class="field">
          <span>Voice</span>
          <select id="voice"></select>
        </label>
        <label class="field">
          <span>Rate</span>
          <div class="range-row">
            <input id="rate" type="range" min="0.5" max="2" step="0.1" value="1" />
            <span id="rate-value">1.0x</span>
          </div>
        </label>
      </section>

      <div class="error" id="reader-error"></div>
    </main>
  `;

  const elements = {
    error: query<HTMLDivElement>(root, "#reader-error"),
    loadPage: query<HTMLButtonElement>(root, "#load-page"),
    next: query<HTMLButtonElement>(root, "#next"),
    pause: query<HTMLButtonElement>(root, "#pause"),
    pickStart: query<HTMLButtonElement>(root, "#pick-start"),
    play: query<HTMLButtonElement>(root, "#play"),
    previous: query<HTMLButtonElement>(root, "#previous"),
    progress: query<HTMLSpanElement>(root, "#reader-progress"),
    rate: query<HTMLInputElement>(root, "#rate"),
    rateValue: query<HTMLSpanElement>(root, "#rate-value"),
    source: query<HTMLSpanElement>(root, "#reader-source"),
    status: query<HTMLSpanElement>(root, "#reader-status"),
    stop: query<HTMLButtonElement>(root, "#stop"),
    title: query<HTMLHeadingElement>(root, "#reader-title"),
    voice: query<HTMLSelectElement>(root, "#voice")
  };

  elements.loadPage.addEventListener("click", () => {
    void sendCommand({ type: "reader/load-active-tab" });
  });
  elements.pickStart.addEventListener("click", () => {
    void sendCommand({ type: "reader/pick-start-position" });
  });
  elements.play.addEventListener("click", () => {
    void sendCommand({ type: "reader/play" });
  });
  elements.pause.addEventListener("click", () => {
    void sendCommand({ type: "reader/pause" });
  });
  elements.stop.addEventListener("click", () => {
    void sendCommand({ type: "reader/stop" });
  });
  elements.next.addEventListener("click", () => {
    void sendCommand({ type: "reader/next" });
  });
  elements.previous.addEventListener("click", () => {
    void sendCommand({ type: "reader/previous" });
  });
  elements.rate.addEventListener("input", () => {
    elements.rateValue.textContent = `${Number(elements.rate.value).toFixed(1)}x`;
  });
  elements.rate.addEventListener("change", () => {
    void sendCommand({
      type: "reader/set-rate",
      rate: Number(elements.rate.value)
    });
  });
  elements.voice.addEventListener("change", () => {
    const value = elements.voice.value || null;
    void sendCommand({
      type: "reader/set-voice",
      voiceName: value
    });
  });

  chrome.runtime.onMessage.addListener((message: RuntimeEvent) => {
    if (message.type !== "reader/state") {
      return;
    }

    renderState(elements, message.state);
  });

  void hydrate(elements);
}

async function hydrate(elements: AppElements): Promise<void> {
  const initialState = await sendCommand({
    type: "reader/get-state"
  });
  renderState(elements, initialState);

  const activeTab = await getActiveTab();

  if (shouldLoadActiveTabContent(initialState, activeTab)) {
    const loadedState = await sendCommand({
      type: "reader/load-active-tab"
    });
    renderState(elements, loadedState);
  }
}

function renderState(elements: AppElements, state: ReaderState): void {
  elements.title.textContent = state.title || "Open any article page to start.";
  elements.status.textContent = STATUS_LABELS[state.status];
  elements.source.textContent = `Source: ${state.source ?? "—"}`;
  elements.progress.textContent = `Paragraph ${Math.min(
    state.currentIndex + (state.paragraphs.length ? 1 : 0),
    state.paragraphs.length
  )} / ${state.paragraphs.length}`;
  elements.rate.value = String(state.rate);
  elements.rateValue.textContent = `${state.rate.toFixed(1)}x`;
  renderVoices(elements.voice, state.availableVoices, state.voiceName);
  elements.error.textContent = state.error ?? "";
  elements.error.classList.toggle("is-visible", Boolean(state.error));

  const hasParagraphs = state.paragraphs.length > 0;
  elements.play.disabled = !hasParagraphs;
  elements.pickStart.disabled = false;
  elements.pause.disabled = !hasParagraphs || state.status !== "playing";
  elements.stop.disabled = !hasParagraphs;
  elements.next.disabled = !hasParagraphs;
  elements.previous.disabled = !hasParagraphs;
}

function renderVoices(
  select: HTMLSelectElement,
  voices: VoiceOption[],
  activeVoice: string | null
): void {
  const options = [
    `<option value="">System default</option>`,
    ...voices.map(
      (voice) =>
        `<option value="${escapeHtml(voice.name)}">${escapeHtml(
          `${voice.name}${voice.lang ? ` (${voice.lang})` : ""}`
        )}</option>`
    )
  ];

  select.innerHTML = options.join("");
  select.value = activeVoice ?? "";
}

function sendCommand(command: BackgroundCommand): Promise<ReaderState> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(command, (response: ReaderState | undefined) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response as ReaderState);
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

function query<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const element = root.querySelector(selector);

  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element as T;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type AppElements = {
  error: HTMLDivElement;
  loadPage: HTMLButtonElement;
  next: HTMLButtonElement;
  pause: HTMLButtonElement;
  pickStart: HTMLButtonElement;
  play: HTMLButtonElement;
  previous: HTMLButtonElement;
  progress: HTMLSpanElement;
  rate: HTMLInputElement;
  rateValue: HTMLSpanElement;
  source: HTMLSpanElement;
  status: HTMLSpanElement;
  stop: HTMLButtonElement;
  title: HTMLHeadingElement;
  voice: HTMLSelectElement;
};
