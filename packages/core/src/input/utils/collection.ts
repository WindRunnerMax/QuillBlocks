import type { Op } from "block-kit-delta";
import { getOpLength } from "block-kit-delta";

import type { Editor } from "../../editor";
import type { Point } from "../../selection/modules/point";
import type { LeafState } from "../../state/modules/leaf-state";

/**
 * 基于 Ops 获取 Length 位置的 Op
 * @param ops
 * @param length
 */
export const pickOpAtLength = (ops: Op[], length: number): Op | null => {
  let index = length;
  for (const op of ops) {
    const opLength = getOpLength(op);
    if (opLength >= index) {
      return op;
    }
    index = index - opLength;
  }
  return null;
};

/**
 * 基于 Range 获取索引位置的 Op
 * @param editor
 * @param point
 */
export const pickOpAtPoint = (editor: Editor, point: Point): Op | null => {
  const block = editor.state.block;
  const line = block.getLine(point.line);
  if (!line) return null;
  const ops = line.getOps();
  return pickOpAtLength(ops, point.offset);
};

/**
 * 基于 Range 获取索引位置的 Leaf
 * @param editor
 * @param point
 */
export const pickLeafAtPoint = (editor: Editor, point: Point): LeafState | null => {
  const block = editor.state.block;
  const line = block.getLine(point.line);
  if (!line) return null;
  const leaves = line.getLeaves();
  let index = point.offset;
  for (const leaf of leaves) {
    const opLength = leaf.length;
    if (opLength >= index) return leaf;
    index = index - opLength;
  }
  return null;
};
