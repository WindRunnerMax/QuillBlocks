import type { Op } from "block-kit-delta";
import { getOpLength } from "block-kit-delta";

import type { Editor } from "../editor";
import type { Point } from "../selection/modules/point";
import type { Range } from "../selection/modules/range";
import type { LeafState } from "../state/modules/leaf-state";

export class Collect {
  /**
   * 构造函数
   * @param editor
   */
  constructor(private editor: Editor) {}

  /**
   * 基于 Ops 获取 Length 位置的 Op
   * @param ops
   * @param length
   */
  public getOpAtLength(ops: Op[], length: number): Op | null {
    let index = length;
    for (const op of ops) {
      const opLength = getOpLength(op);
      if (opLength >= index) {
        return op;
      }
      index = index - opLength;
    }
    return null;
  }

  /**
   * 基于 Range 获取索引位置的 Op
   * @param editor
   * @param point
   */
  public getOpAtPoint(point: Point): Op | null {
    const block = this.editor.state.block;
    const line = block.getLine(point.line);
    if (!line) return null;
    const ops = line.getOps();
    return this.getOpAtLength(ops, point.offset);
  }

  /**
   * 基于 Range 获取索引位置的 Leaf
   * @param editor
   * @param point
   */
  public getLeafAtPoint(point: Point): LeafState | null {
    const block = this.editor.state.block;
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
  }

  /**
   * 通过 Range 获取 Delta 片段
   * @param range
   */
  public getFragment(range?: Range): Op[] | null {
    const at = range || this.editor.selection.get();
    if (!at || at.isCollapsed) return null;
    const { start, end } = at;
    const block = this.editor.state.block;
    // 如果是同行则直接 slice
    if (start.line === end.line) {
      const lineState = block.getLine(start.line);
      const nextOps = lineState ? lineState.slice(start.offset, end.offset) : [];
      return nextOps;
    }
    const ops: Op[] = [];
    // 处理首行
    const firstLine = block.getLine(start.line);
    const firstOps = firstLine ? firstLine.slice(start.offset, firstLine.length) : [];
    ops.push(...firstOps);
    // 处理中间行
    for (let i = start.line + 1, len = end.line - 1; i <= len; i++) {
      const lineState = block.getLine(i);
      if (!lineState) continue;
      ops.push(...lineState.getOps());
    }
    // 处理尾行
    const lastLine = block.getLine(end.line);
    const lastOps = lastLine ? lastLine.slice(0, end.offset) : [];
    ops.push(...lastOps);
    return ops;
  }
}
