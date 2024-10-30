import type { Editor } from "../../editor";
import { getLeafNode, getLineNode } from "../../model/utils/dom";
import { Point } from "../modules/point";
import { Range } from "../modules/range";
import type { DOMPoint } from "../types";
import { isEmbedZeroNode, isEnterZeroNode, isVoidZeroNode } from "./dom";
import { normalizeDOMPoint } from "./native";

/**
 * 将 DOMPoint 转换为 ModelPoint
 * @param editor
 * @param normalizeDOMPoint
 */
export const toModelPoint = (editor: Editor, normalizeDOMPoint: DOMPoint) => {
  const { offset, node } = normalizeDOMPoint;

  const leafNode = getLeafNode(node);
  let lineIndex = 0;
  let leafIndex = 0;
  let leafOffset = 0;

  const lineNode = getLineNode(leafNode);
  const lineModel = editor.model.getLineState(lineNode);
  // COMPAT: 在没有 LineModel 的情况, 选区会置于 BlockState 最前
  if (lineModel) {
    lineIndex = lineModel.index;
  }

  const leafModel = editor.model.getLeafState(leafNode);
  // COMPAT: 在没有 LeafModel 的情况, 选区会置于 Line 最前
  if (leafModel) {
    leafIndex = leafModel.index;
    leafOffset = offset;
  }

  // COMPAT: 此处开始根据 case 修正 zero/void offset [节点级别]
  // Case 1: 当前节点为 data-zero-enter 时, 需要将其修正为前节点末尾
  // content\n[cursor] => content[cursor]\n
  const isEnterZero = isEnterZeroNode(node);
  if (isEnterZero && offset) {
    return new Point(lineIndex, leafIndex, 0);
  }
  // Case 2: 光标位于 data-zero-void 节点前时, 需要将其修正为节点末
  // 若不修正则会导致选区位置问题, 一些诸如删除之类的操作会失效
  // [[cursor]void]\n => [void[cursor]]\n
  // Case 3: 光标位于 data-zero-void 节点后其他位置时, 修正为节点末
  // 唤起 IME 输入时会导致原本零宽字符出现过多文本, 导致选区映射问题
  // [ xxx[cursor]]\n => [ [cursor]xxx]\n
  const isVoidZero = isVoidZeroNode(node);
  if (isVoidZero && offset !== 1) {
    return new Point(lineIndex, leafIndex, 1);
  }
  // Case 4: 光标位于 data-zero-embed 节点后时, 需要将其修正为节点前
  // 若不校正会携带 DOM-Point CASE1 的零选区位置, 按下左键无法正常移动光标
  // [embed[cursor]]\n => [[cursor]embed]\n
  const isEmbedZero = isEmbedZeroNode(node);
  if (isEmbedZero && offset) {
    return new Point(lineIndex, leafIndex, 0);
  }

  return new Point(lineIndex, leafIndex, leafOffset);
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
    // FIX: ModelRange 必然是 start -> end, 无需根据 Backward 修正
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
