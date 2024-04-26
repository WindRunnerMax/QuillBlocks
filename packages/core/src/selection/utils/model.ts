import { ROOT_ZONE } from "laser-utils";

import type { Editor } from "../../editor";
import { getLineNode, getModelElement } from "../../model/utils/dom";
import { Point } from "../point";
import { Range } from "../range";
import type { DOMPoint } from "./dom";
import { normalizeDOMPoint } from "./native";

export const toModelPoint = (editor: Editor, normalizeDOMPoint: DOMPoint) => {
  const { offset, node } = normalizeDOMPoint;

  const modelNode = getModelElement(node);
  let lineModelIndex = 0;
  let leafModelOffset = 0;

  const lineNode = getLineNode(modelNode);
  // TODO: 兜底没有`LineState`的情况 选区置于`ZoneState`最前/最后
  const lineModel = editor.model.getLineModel(lineNode);
  if (lineModel) {
    lineModelIndex = lineModel.index;
  }

  const leafModel = editor.model.getLeafModel(modelNode);
  if (leafModel) {
    leafModelOffset = leafModel.offset + offset;
  }

  // TODO: 根据`case`修正`void offset`
  // TODO: 通过`state + model`取得`line`、`zone`、`offset`
  return new Point(
    lineModelIndex,
    leafModelOffset,
    (lineModel && lineModel.getZoneId()) || ROOT_ZONE
  );
};

export const toModelRange = (editor: Editor, staticSel: StaticRange, isBackward: boolean) => {
  const { startContainer, endContainer, collapsed, startOffset, endOffset } = staticSel;
  let anchorRangePoint: Point;
  let focusRangePoint: Point;
  if (!collapsed) {
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
