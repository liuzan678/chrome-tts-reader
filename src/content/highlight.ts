const STYLE_ID = "__chrome_tts_reader_style";
const ACTIVE_CLASS = "__chrome_tts_reader_active";

let activeElement: Element | null = null;

export function clearHighlight(document: Document): void {
  if (activeElement) {
    activeElement.classList.remove(ACTIVE_CLASS);
    activeElement = null;
  }

  const stale = document.querySelector(`.${ACTIVE_CLASS}`);
  if (stale) {
    stale.classList.remove(ACTIVE_CLASS);
  }
}

export function highlightElement(
  document: Document,
  element: Element | null
): void {
  ensureStyle(document);
  clearHighlight(document);

  if (!element) {
    return;
  }

  activeElement = element;
  element.classList.add(ACTIVE_CLASS);

  if (element instanceof document.defaultView!.HTMLElement) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

function ensureStyle(document: Document): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${ACTIVE_CLASS} {
      background: linear-gradient(120deg, rgba(255, 227, 138, 0.55), rgba(255, 170, 90, 0.35));
      border-radius: 0.35rem;
      box-shadow: 0 0 0 3px rgba(255, 170, 90, 0.18);
      transition: background 140ms ease, box-shadow 140ms ease;
    }
  `;
  document.head.appendChild(style);
}
