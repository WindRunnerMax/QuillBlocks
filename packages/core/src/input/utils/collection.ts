import type { Op } from "block-kit-delta";
import { getOpLength } from "block-kit-delta";

import type { Editor } from "../../editor";
import type { Range } from "../../selection/modules/range";
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
 * 获取索引位置的 Op
 * @param editor
 * @param length
 */
export const pickOpAtIndex = (editor: Editor, length: number): Op | null => {
  const delta = editor.state.toBlockSet();
  const ops = delta.ops;
  return pickOpAtLength(ops, length);
};

/**
 * 基于 Range 获取索引位置的 Op
 * @param editor
 * @param range 折叠状态的 Range
 */
export const pickOpAtRange = (editor: Editor, range: Range): Op | null => {
  const block = editor.state.block;
  const line = block.getLine(range.start.line);
  if (!line) return null;
  const ops = line.getOps();
  return pickOpAtLength(ops, range.start.offset);
};

/**
 * 基于 Range 获取索引位置的 Leaf
 * @param editor
 * @param range 折叠状态的 Range
 */
export const pickLeafAtRange = (editor: Editor, range: Range): LeafState | null => {
  const block = editor.state.block;
  const line = block.getLine(range.start.line);
  if (!line) return null;
  const leaves = line.getLeaves();
  let index = length;
  for (const leaf of leaves) {
    const opLength = leaf.length;
    if (opLength >= index) {
      return leaf;
    }
    index = index - opLength;
  }
  return null;
};
