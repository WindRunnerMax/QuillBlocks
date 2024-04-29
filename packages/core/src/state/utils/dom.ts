import type { DOMSelection, DOMStaticRange } from "./types";

export const getRootSelection = (root?: Element): DOMSelection | null => {
  if (root) {
    // Maybe deal with shadow dom in the future
    const doc = root.ownerDocument;
    const sel = doc.getSelection();
    return sel;
  } else {
    return window.getSelection();
  }
};

export const getStaticSelection = (sel?: Selection | null): DOMStaticRange | null => {
  const selection = sel ? getRootSelection() : sel;
  if (!selection || !selection.anchorNode || !selection.focusNode) {
    return null;
  }
  let range: DOMStaticRange | null = null;
  if (selection.rangeCount >= 1) {
    range = selection.getRangeAt(0);
  }
  if (!range) {
    const compat = document.createRange();
    compat.setStart(selection.anchorNode, selection.anchorOffset);
    compat.setEnd(selection.focusNode, selection.focusOffset);
    range = compat;
  }
  return range;
};
