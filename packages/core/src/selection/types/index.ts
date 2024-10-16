import type { Object } from "block-kit-utils";

export const DIRECTION = {
  FORWARD: "forward",
  BACKWARD: "backward",
} as const;

export type DOMPoint = {
  node: Node | null;
  offset: number;
};

// NodeType https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
export type DOMRange = globalThis.Range;
export type DOMSelection = globalThis.Selection;
export type DOMStaticRange = globalThis.StaticRange;
export type Direction = Object.Values<typeof DIRECTION>;
export type DOMComment = globalThis.Comment;
export type DOMNode = globalThis.Node;
export type DOMText = globalThis.Text;
export type DOMElement = globalThis.Element;
