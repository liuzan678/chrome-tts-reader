import type { BackgroundCommand } from "../shared/contracts";
import type { ReadableContentSession } from "./session";
import { findPickStartIndex } from "./pick";
import {
  disablePickStartVisuals,
  enablePickStartVisuals,
  PICK_HINT_TEXT,
  PICK_MODE_CLASS,
  PICK_TARGET_CLASS
} from "./pick-visuals";

export { PICK_HINT_TEXT, PICK_MODE_CLASS, PICK_TARGET_CLASS };

export type PickStartController = {
  begin: () => void;
};

export function createPickStartController(
  document: Document,
  session: ReadableContentSession,
  sendCommand: (command: BackgroundCommand) => void = sendBackgroundCommand
): PickStartController {
  let active = false;

  const cleanup = (): void => {
    active = false;
    disablePickStartVisuals(document);
    document.removeEventListener("click", handleClick, true);
    document.removeEventListener("keydown", handleKeyDown, true);
  };

  const handleClick = (event: MouseEvent): void => {
    if (!active) {
      return;
    }

    const index = findPickStartIndex(event.target, session.getSnapshot()?.elements ?? []);

    if (index === null) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    cleanup();
    sendCommand({
      type: "reader/start-from-index",
      index
    });
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (!active || event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    cleanup();
  };

  return {
    begin: () => {
      if (active) {
        return;
      }

      active = true;
      enablePickStartVisuals(document, session.getSnapshot()?.elements ?? []);
      document.addEventListener("click", handleClick, true);
      document.addEventListener("keydown", handleKeyDown, true);
    }
  };
}

function sendBackgroundCommand(command: BackgroundCommand): void {
  chrome.runtime.sendMessage(command, () => {
    void chrome.runtime.lastError;
  });
}
