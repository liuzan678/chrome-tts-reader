const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "[role='button']"
].join(", ");

export function findPickStartIndex(
  target: EventTarget | null,
  elements: Array<Element | null>
): number | null {
  const origin = getTargetElement(target);

  if (!origin || origin.closest(INTERACTIVE_SELECTOR)) {
    return null;
  }

  let current: Element | null = origin;

  while (current) {
    const index = elements.findIndex((element) => element === current);

    if (index >= 0) {
      return index;
    }

    current = current.parentElement;
  }

  return null;
}

function getTargetElement(target: EventTarget | null): Element | null {
  if (!target) {
    return null;
  }

  const node = target as Node;
  const window = node.ownerDocument?.defaultView;

  if (window && target instanceof window.Element) {
    return target;
  }

  if (window && target instanceof window.Node) {
    return target.parentElement;
  }

  return null;
}
