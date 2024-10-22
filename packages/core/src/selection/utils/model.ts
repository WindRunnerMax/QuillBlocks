import type { Editor } from "../../editor";
import { getLineNode, getModelElement } from "../../model/utils/dom";
import { Point } from "../modules/point";
import { Range } from "../modules/range";
import type { DOMPoint } from "../types";
import { isEnterZeroNode, isVoidZeroNode } from "./dom";
import { normalizeDOMPoint } from "./native";

/**
 * 将 DOMPoint 转换为 ModelPoint
 * @param editor
 * @param normalizeDOMPoint
 */
export const toModelPoint = (editor: Editor, normalizeDOMPoint: DOMPoint) => {
  const { offset, node } = normalizeDOMPoint;

  const modelNode = getModelElement(node);
  let lineIndex = 0;
  let leafOffset = 0;

  const lineNode = getLineNode(modelNode);
  const lineModel = editor.model.getLineState(lineNode);
  // COMPAT: 在没有 LineModel 的情况, 选区会置于 BlockState 最前
  if (lineModel) {
    lineIndex = lineModel.index;
  }

  const leafModel = editor.model.getLeafState(modelNode);
  // COMPAT: 在没有 LeafModel 的情况, 选区会置于 Line 最前
  if (leafModel) {
    leafOffset = leafModel.offset + offset;
  }

  // COMPAT: 此处开始根据 case 修正 zero/void offset [节点级别]
  // Case 1: 当前节点为 data-zero-enter 时, 需要将其修正为前节点末尾
  // content\n[cursor] => content[cursor]\n
  const isEnterZero = isEnterZeroNode(node);
  if (isEnterZero && offset) {
    leafOffset = Math.max(leafOffset - 1, 0);
    return new Point(lineIndex, leafOffset);
  }
  // Case 2: 光标位于 data-zero-void 节点前时, 需要将其修正为节点末
  // [cursor][void]\n => [void][cursor]\n
  // Case 3: 光标位于 data-zero-void 节点唤起 IME 输入, 修正为节点末
  // [ xxx[cursor]]\n => [ [cursor]xxx]\n
  const isVoidZero = isVoidZeroNode(node);
  if (isVoidZero && offset !== 1) {
    return new Point(lineIndex, 1);
  }

  return new Point(lineIndex, leafOffset);
};

/**
 * 将 DOMStaticRange 转换为 ModelRange
 * @param editor
 * @param staticSel
 * @param isBackward
 */
export const toModelRange = (editor: Editor, staticSel: StaticRange, isBackward: boolean) => {
  const { startContainer, endContainer, collapsed, startOffset, endOffset } = staticSel;
  let anchorRangePoint: Point;
  let focusRangePoint: Point;
  if (!collapsed) {
    // FIX: ModelRange = start -> end, 无需根据 Backward 修正
    const anchorDOMPoint = normalizeDOMPoint({
      node: startContainer,
      offset: startOffset,
    });
    const focusDOMPoint = normalizeDOMPoint({
      node: endContainer,
      offset: endOffset,
    });
    anchorRangePoint = toModelPoint(editor, anchorDOMPoint);
    focusRangePoint = toModelPoint(editor, focusDOMPoint);
  } else {
    const anchorDOMPoint = normalizeDOMPoint({
      node: startContainer,
      offset: startOffset,
    });
    anchorRangePoint = toModelPoint(editor, anchorDOMPoint);
    focusRangePoint = anchorRangePoint.clone();
  }
  return new Range(anchorRangePoint, focusRangePoint, isBackward, collapsed);
};
