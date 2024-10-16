import { isDOMElement, isDOMText } from "block-kit-utils";

import type { Editor } from "../../editor";
import { LEAF_STRING, ZERO_SPACE_KEY } from "../../model/types";
import type { Point } from "../modules/point";
import type { Range } from "../modules/range";
import type { DOMPoint, DOMStaticRange } from "../types";
import { DIRECTION } from "../types";
import { getEditableChild, getEditableChildAndIndex, getTextNode } from "./dom";

/**
 * 规范化 DOMPoint
 * @param domPoint DOM 节点
 */
export const normalizeDOMPoint = (domPoint: DOMPoint): DOMPoint => {
  let { node, offset } = domPoint;

  // If it's an element node, its offset refers to the index of its children
  // 此处说明节点非 Text 节点, 需要将选区转移到 Text 节点
  // 例如 行节点、Void 节点
  if (isDOMElement(node) && node.childNodes.length) {
    let isLast = offset === node.childNodes.length;
    let index = isLast ? offset - 1 : offset;
    // including comment nodes, so try to find the right text child node.
    [node, index] = getEditableChildAndIndex(
      node,
      index,
      isLast ? DIRECTION.BACKWARD : DIRECTION.FORWARD
    );

    // If the editable child found is in front of input offset,
    // we instead seek to its end
    // 将焦点转移到 Text 后, 新节点的 offset 为 Text 节点的首尾
    isLast = index < offset;

    // If the node has children, traverse until we have a leaf node.
    // Leaf nodes can be either text nodes, or other void DOM nodes.
    while (isDOMElement(node) && node.childNodes.length) {
      const i = isLast ? node.childNodes.length - 1 : 0;
      node = getEditableChild(node, i, isLast ? DIRECTION.BACKWARD : DIRECTION.FORWARD);
    }

    // Determine the new offset inside the text node.
    // `backward` and the text is not empty, cursor is at the end of the `leaf node`
    // otherwise the cursor is at the start of the `leaf node`
    offset = isLast && node.textContent !== null ? node.textContent.length : 0;
  }

  // If the node is a text node itself, use the offset directly.
  return { node, offset };
};

/**
 * 将 ModalPoint 转换为 DOMPoint
 * @param editor
 * @param point
 */
export const toDOMPoint = (editor: Editor, point: Point): DOMPoint => {
  const { line, offset } = point;
  const blockState = editor.state.block;
  const lineState = blockState && blockState.getLine(line);
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
  const selector = `[${LEAF_STRING}], [${ZERO_SPACE_KEY}]`;
  // Maybe use LineState Model to iterate over node ?
  const leaves = Array.from(lineNode.querySelectorAll(selector));
  let start = 0;
  for (const leaf of leaves) {
    if (!leaf || !(leaf instanceof HTMLElement) || leaf.textContent === null) {
      continue;
    }
    let len = leaf.textContent.length;
    if (leaf.hasAttribute(ZERO_SPACE_KEY)) {
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

/**
 * 将 ModalRange 转换为 DOMRange
 * @param editor
 * @param range
 */
export const toDOMRange = (editor: Editor, range: Range): DOMStaticRange | null => {
  const { start, end } = range;
  const startDOMPoint = toDOMPoint(editor, start);
  const endDOMPoint = range.isCollapsed ? startDOMPoint : toDOMPoint(editor, end);
  if (!startDOMPoint.node || !endDOMPoint.node) {
    return null;
  }
  const domRange = window.document.createRange();
  // FIX: Range = start -> end
  const { node: startNode, offset: startOffset } = startDOMPoint;
  const { node: endNode, offset: endOffset } = endDOMPoint;
  const startTextNode = getTextNode(startNode);
  const endTextNode = getTextNode(endNode);
  if (startTextNode && endTextNode) {
    domRange.setStart(startTextNode, startOffset);
    domRange.setEnd(endTextNode, endOffset);
    return domRange;
  }
  return null;
};

/**
 * 判断两个 DOMStaticRange 是否相等
 * @param a
 * @param b
 */
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