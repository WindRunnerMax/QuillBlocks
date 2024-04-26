import type { Editor } from "../../editor";
import { LEAF_STRING, ZERO_SPACE } from "../../model/constant";
import type { Point } from "../point";
import type { Range } from "../range";
import type { DOMPoint, DOMStaticRange } from "./dom";
import { getEditableChild, getEditableChildAndIndex, getTextNode } from "./dom";
import { isDOMElement, isDOMText } from "./is";

export const normalizeDOMPoint = (domPoint: DOMPoint): DOMPoint => {
  let { node, offset } = domPoint;

  // If it's an element node, its offset refers to the index of its children
  if (isDOMElement(node) && node.childNodes.length) {
    let isLast = offset === node.childNodes.length;
    let index = isLast ? offset - 1 : offset;
    // including comment nodes, so try to find the right text child node.
    [node, index] = getEditableChildAndIndex(node, index, isLast ? "backward" : "forward");

    // If the editable child found is in front of input offset,
    // we instead seek to its end
    isLast = index < offset;

    // If the node has children, traverse until we have a leaf node.
    // Leaf nodes can be either text nodes, or other void DOM nodes.
    while (isDOMElement(node) && node.childNodes.length) {
      const i = isLast ? node.childNodes.length - 1 : 0;
      node = getEditableChild(node, i, isLast ? "backward" : "forward");
    }

    // Determine the new offset inside the text node.
    // `backward` and the text is not empty, cursor is at the end of the `leaf node`
    // otherwise the cursor is at the start of the `leaf node`
    offset = isLast && node.textContent !== null ? node.textContent.length : 0;
  }

  // If the node is a text node itself, use the offset directly.
  return { node, offset };
};

export const toDOMPoint = (editor: Editor, point: Point): DOMPoint => {
  const { line, zoneId, offset } = point;
  const zoneState = editor.state.getZoneState(zoneId);
  const lineState = zoneState && zoneState.getLine(line);
  const lineNode = editor.model.getLineNode(lineState);
  if (!lineNode) {
    return { node: null, offset: 0 };
  }
  if (isDOMText(lineNode)) {
    return { node: lineNode, offset };
  }

  // For each leaf, we need to isolate its content, which means filtering
  // to its direct text and zero-width spans. (We have to filter out any
  // other siblings that may have been rendered alongside them.)
  const selector = `[${LEAF_STRING}], [${ZERO_SPACE}]`;
  // Maybe use LineState Model to iterate over node ?
  const leaves = Array.from(lineNode.querySelectorAll(selector));
  let start = 0;
  for (const leaf of leaves) {
    if (!leaf || !(leaf instanceof HTMLElement) || leaf.textContent === null) {
      continue;
    }
    let len = leaf.textContent.length;
    if (leaf.hasAttribute(ZERO_SPACE)) {
      // TODO: void element & fake length
      len = 1;
    }

    const end = start + len;
    if (offset <= end) {
      // `Offset` will become the offset of this node
      // text1text2 offset: 7 -> text1te|xt2
      // current node is text2 -> start = 5
      // end = 5(start) + 5(len) = 10
      // offset = 7 < 10 -> new offset = 7(offset) - 5(start) = 2
      return { node: leaf, offset: Math.max(offset - start, 0) };
    }
    start = end;
  }
  return { node: null, offset: 0 };
};

export const toDOMRange = (editor: Editor, range: Range): DOMStaticRange | null => {
  const { start, end } = range;
  const anchor = toDOMPoint(editor, start);
  const focus = range.isCollapsed ? anchor : toDOMPoint(editor, end);
  if (!anchor.node || !focus.node) {
    return null;
  }
  const domRange = window.document.createRange();
  const { node: startNode, offset: startOffset } = range.isBackward ? focus : anchor;
  const { node: endNode, offset: endOffset } = range.isBackward ? anchor : focus;
  const startTextNode = getTextNode(startNode);
  const endTextNode = getTextNode(endNode);
  if (startTextNode && endTextNode) {
    domRange.setStart(startTextNode, startOffset);
    domRange.setEnd(endTextNode, endOffset);
    return domRange;
  }
  return null;
};

export const isEqualDOMRange = (a: DOMStaticRange | null, b: DOMStaticRange | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.startContainer === b.startContainer &&
    a.startOffset === b.startOffset &&
    a.endContainer === b.endContainer &&
    a.endOffset === b.endOffset
  );
};
