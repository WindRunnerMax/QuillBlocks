import { EDITABLE_KEY } from "../../state/utils/constant";
import type { DOMElement, DOMNode } from "./is";
import { isDOMComment, isDOMElement, isDOMText } from "./is";

export type DOMRange = globalThis.Range;
export type DOMSelection = globalThis.Selection;
export type DOMStaticRange = globalThis.StaticRange;
export type Direction = "forward" | "backward";

export type DOMPoint = {
  node: Node | null;
  offset: number;
};

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

/**
 * Get the nearest editable child and index at `index` in a `parent`,
 * preferring `direction`.
 */
export const getEditableChildAndIndex = (
  parent: DOMElement,
  index: number,
  direction: Direction
): [DOMNode, number] => {
  const { childNodes } = parent;
  let child = childNodes[index];
  let i = index;
  let triedForward = false;
  let triedBackward = false;

  // While the child is a comment node, or an element node with no children,
  // keep iterating to find a sibling non-void, non-comment node.
  while (
    isDOMComment(child) ||
    (isDOMElement(child) && child.childNodes.length === 0) ||
    (isDOMElement(child) && child.getAttribute(EDITABLE_KEY) === "false")
  ) {
    if (triedForward && triedBackward) {
      break;
    }

    if (i >= childNodes.length) {
      triedForward = true;
      i = index - 1;
      direction = "backward";
      continue;
    }

    if (i < 0) {
      triedBackward = true;
      i = index + 1;
      direction = "forward";
      continue;
    }

    child = childNodes[i];
    index = i;
    i += direction === "forward" ? 1 : -1;
  }

  return [child, index];
};

/**
 * Get the nearest editable child at `index` in a `parent`, preferring
 * `direction`.
 */
export const getEditableChild = (
  parent: DOMElement,
  index: number,
  direction: Direction
): DOMNode => {
  const [child] = getEditableChildAndIndex(parent, index, direction);
  return child;
};

export const getTextNode = (node: Node | null): Text | null => {
  if (isDOMText(node)) return node;
  if (isDOMElement(node)) {
    const textNode = node.childNodes[0];
    if (textNode && isDOMText(textNode)) return textNode;
  }
  return null;
};
