import { flushSync } from "react-dom";

export const MORPH_NAME = "show-detail-morph";

type ViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition;
};

export function supportsViewTransitions(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof (document as DocumentWithViewTransition).startViewTransition === "function"
  );
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function canMorph(): boolean {
  return supportsViewTransitions() && !prefersReducedMotion();
}

/**
 * Morph the given card element into the detail dialog. The card lends its
 * view-transition-name to the dialog for the duration of the transition, so the
 * browser can animate the card's box into the dialog's box.
 */
export function morphToDialog(cardEl: HTMLElement | null, open: () => void): void {
  if (!cardEl || !canMorph()) {
    open();
    return;
  }

  cardEl.style.viewTransitionName = MORPH_NAME;

  (document as DocumentWithViewTransition).startViewTransition!(() => {
    flushSync(() => open());
    // Hand the name over to the now-mounted dialog by releasing it here.
    cardEl.style.viewTransitionName = "";
  });
}

/**
 * Morph the detail dialog back into the card it originated from. The dialog owns
 * the name while open; on close we unmount it and return it to the card.
 */
export function morphFromDialog(cardEl: HTMLElement | null, close: () => void): void {
  if (!canMorph()) {
    close();
    return;
  }

  const transition = (document as DocumentWithViewTransition).startViewTransition!(() => {
    flushSync(() => close());
    if (cardEl) cardEl.style.viewTransitionName = MORPH_NAME;
  });

  transition.finished.finally(() => {
    if (cardEl) cardEl.style.viewTransitionName = "";
  });
}
