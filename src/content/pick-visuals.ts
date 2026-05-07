const PICK_STYLE_ID = "__chrome_tts_reader_pick_style";
const PICK_HINT_ID = "__chrome_tts_reader_pick_hint";

export const PICK_MODE_CLASS = "__chrome_tts_reader_pick_mode";
export const PICK_TARGET_CLASS = "__chrome_tts_reader_pick_target";
export const PICK_HINT_TEXT = "点击页面中的段落以开始阅读，按 Esc 取消";

export function enablePickStartVisuals(
  document: Document,
  elements: Array<Element | null>
): void {
  ensureStyle(document);
  disablePickStartVisuals(document);

  document.documentElement.classList.add(PICK_MODE_CLASS);

  for (const element of new Set(elements)) {
    if (element) {
      element.classList.add(PICK_TARGET_CLASS);
    }
  }

  ensureHint(document);
}

export function disablePickStartVisuals(document: Document): void {
  document.documentElement.classList.remove(PICK_MODE_CLASS);
  const targets = document.querySelectorAll(`.${PICK_TARGET_CLASS}`);

  for (const target of targets) {
    target.classList.remove(PICK_TARGET_CLASS);
  }

  document.getElementById(PICK_HINT_ID)?.remove();
}

function ensureStyle(document: Document): void {
  if (document.getElementById(PICK_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = PICK_STYLE_ID;
  style.textContent = `
    html.${PICK_MODE_CLASS} .${PICK_TARGET_CLASS} {
      cursor: crosshair;
      outline: 2px dashed rgba(255, 170, 90, 0.75);
      outline-offset: 4px;
      transition: outline-color 140ms ease, background 140ms ease, box-shadow 140ms ease;
    }

    html.${PICK_MODE_CLASS} .${PICK_TARGET_CLASS}:hover {
      background: linear-gradient(120deg, rgba(255, 227, 138, 0.45), rgba(255, 170, 90, 0.28));
      box-shadow: 0 0 0 3px rgba(255, 170, 90, 0.16);
    }

    #${PICK_HINT_ID} {
      position: fixed;
      top: 16px;
      left: 50%;
      z-index: 2147483647;
      transform: translateX(-50%);
      max-width: min(560px, calc(100vw - 32px));
      padding: 10px 14px;
      border: 1px solid rgba(255, 170, 90, 0.52);
      border-radius: 999px;
      background: rgba(38, 27, 15, 0.9);
      color: #fff3e0;
      font: 500 13px/1.4 "SF Pro Text", "Segoe UI", sans-serif;
      letter-spacing: 0.01em;
      box-shadow: 0 12px 36px rgba(15, 10, 2, 0.24);
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

function ensureHint(document: Document): void {
  if (document.getElementById(PICK_HINT_ID)) {
    return;
  }

  const hint = document.createElement("div");
  hint.id = PICK_HINT_ID;
  hint.textContent = PICK_HINT_TEXT;
  (document.body ?? document.documentElement).appendChild(hint);
}
