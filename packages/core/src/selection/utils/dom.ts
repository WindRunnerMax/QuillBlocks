import { isDOMComment, isDOMElement, isDOMText } from "block-kit-utils";

import { EDITABLE, ZERO_ENTER_KEY, ZERO_SPACE_KEY, ZERO_VOID_KEY } from "../../model/types";
import type { Direction, DOMElement, DOMNode, DOMSelection, DOMStaticRange } from "../types";
import { DIRECTION } from "../types";

/**
 * 获取当前的 DOMSelection
 * @param root
 */
export const getRootSelection = (root?: Element): DOMSelection | null => {
  if (root) {
    // 在 shadowRoot 中需要获取 ownerDocument 的 Selection
    const doc = root.ownerDocument;
    const sel = doc.getSelection();
    return sel;
  } else {
    return window.getSelection();
  }
};

/**
 * 获取当前的 DOMStaticRange
 * @param sel
 */
export const getStaticSelection = (sel?: Selection | null): DOMStaticRange | null => {
  const selection = sel ? sel : getRootSelection();
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
 * 获取 parent 中 index 处附近的可编辑节点和索引
 * 优先 direction 方向的查找
 * @param parent
 * @param index
 * @param direction
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
  // 当前节点为 注释节点/空元素节点/不可编辑元素节点 时, 继续查找下一个可编辑节点
  while (
    isDOMComment(child) ||
    (isDOMElement(child) && child.childNodes.length === 0) ||
    (isDOMElement(child) && child.getAttribute(EDITABLE) === "false")
  ) {
    if (triedForward && triedBackward) {
      break;
    }

    if (i >= childNodes.length) {
      triedForward = true;
      i = index - 1;
      // <- 向后查找 -1
      direction = DIRECTION.BACKWARD;
      continue;
    }

    if (i < 0) {
      triedBackward = true;
      i = index + 1;
      // -> 向前查找 +1
      direction = DIRECTION.FORWARD;
      continue;
    }

    child = childNodes[i];
    index = i;
    // +1: 向前查找 -1: 向后查找
    const increment = direction === DIRECTION.FORWARD ? 1 : -1;
    i = i + increment;
  }

  return [child, index];
};

/**
 * 获取 parent 中 index 处附近的可编辑节点
 * 优先 direction 方向的查找
 * @param parent
 * @param index
 * @param direction
 */
export const getEditableChild = (
  parent: DOMElement,
  index: number,
  direction: Direction
): DOMNode => {
  const [child] = getEditableChildAndIndex(parent, index, direction);
  return child;
};

/**
 * 兼容性地获取 Text/Span 的 Text Node
 * @param node
 */
export const getTextNode = (node: Node | null): Text | null => {
  if (isDOMText(node)) {
    return node;
  }
  if (isDOMElement(node)) {
    const textNode = node.childNodes[0];
    if (textNode && isDOMText(textNode)) {
      return textNode;
    }
  }
  return null;
};

/**
 * 根据 DOMSelection 和 DOMStaticRange 判断方向
 * @param sel
 * @param staticSel
 */
export const isBackward = (sel: DOMSelection | null, staticSel: DOMStaticRange | null) => {
  if (!sel || !staticSel) return false;
  const { anchorNode, anchorOffset, focusNode, focusOffset } = sel;
  const { startContainer, startOffset, endContainer, endOffset } = staticSel;
  return (
    anchorNode !== startContainer ||
    anchorOffset !== startOffset ||
    focusNode !== endContainer ||
    focusOffset !== endOffset
  );
};

/**
 * Zero 节点 data-zero-space
 * @param node
 */
export const isZeroNode = (node: Node | null) => {
  if (!node || !node.parentElement) {
    return false;
  }
  return node instanceof HTMLElement
    ? node.hasAttribute(ZERO_SPACE_KEY)
    : node.parentElement.hasAttribute(ZERO_SPACE_KEY);
};

/**
 * Enter Zero 节点 data-enter
 * @param node
 */
export const isEnterZeroNode = (node: Node | null) => {
  if (!node || !node.parentElement) {
    return false;
  }
  return node instanceof HTMLElement
    ? node.hasAttribute(ZERO_ENTER_KEY)
    : node.parentElement.hasAttribute(ZERO_ENTER_KEY);
};

/**
 * Void Zero 节点 data-zero-void
 * @param node
 */
export const isVoidZeroNode = (node: Node | null) => {
  if (!node || !node.parentElement) {
    return false;
  }
  return node instanceof HTMLElement
    ? node.hasAttribute(ZERO_VOID_KEY)
    : node.parentElement.hasAttribute(ZERO_VOID_KEY);
};
