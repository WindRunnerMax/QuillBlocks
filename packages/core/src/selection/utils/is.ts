import type { DOMSelection, DOMStaticRange } from "./dom";

export type DOMComment = globalThis.Comment;
export type DOMNode = globalThis.Node;
export type DOMText = globalThis.Text;
export type DOMElement = globalThis.Element;

// NodeType https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType

export const isDOMNode = (value: unknown): value is DOMNode => {
  // Node
  return !!window && value instanceof window.Node;
};

export const isDOMComment = (value: unknown): value is DOMComment => {
  // Comment Node
  return isDOMNode(value) && value.nodeType === 8;
};

export const isDOMText = (value: unknown): value is DOMText => {
  // Text Node
  return isDOMNode(value) && value.nodeType === 3;
};

export const isDOMElement = (value: unknown): value is DOMElement => {
  // Element Node
  return isDOMNode(value) && value.nodeType === 1;
};

export const isBackward = (sel: DOMSelection | null, staticSel: DOMStaticRange | null) => {
  if (!sel || !staticSel) return false;
  const { anchorNode, anchorOffset, focusNode, focusOffset } = sel;
  const { startContainer, startOffset, endContainer, endOffset } = staticSel;
  // Use DOMStaticRange to determine direction
  return (
    anchorNode !== startContainer ||
    anchorOffset !== startOffset ||
    focusNode !== endContainer ||
    focusOffset !== endOffset
  );
};
