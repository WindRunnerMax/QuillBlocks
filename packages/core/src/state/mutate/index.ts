import type { AttributeMap, Delta, Op } from "block-kit-delta";
import type { InsertOp } from "block-kit-delta";
import {
  cloneOp,
  composeAttributes,
  isEOLOp,
  isEqualAttributes,
  isInsertOp,
  isRetainOp,
  normalizeEOL,
  OP_TYPES,
} from "block-kit-delta";
import { OpIterator } from "block-kit-delta";
import { isObject } from "block-kit-utils";

import type { BlockState } from "../modules/block-state";
import { LeafState } from "../modules/leaf-state";
import { LineState } from "../modules/line-state";
import { Iterator } from "./iterator";

export class Mutate {
  /** 初始 Lines */
  private lines: LineState[];

  /**
   * 构造函数
   * @param block
   */
  constructor(private block: BlockState) {
    this.lines = block.getLines();
  }

  /**
   * 在 LineState 插入 Op
   * @param lineState
   * @param newOp
   */
  private insert(lines: LineState[], lineState: LineState, newLeaf: LeafState): LineState {
    const leaves = lineState.getLeaves();
    const index = leaves.length;
    const lastLeaf = lineState.getLastLeaf();
    const lastOp = lastLeaf && lastLeaf.op;
    const newOp = newLeaf.op;
    // 如果 NewOp/LastOp 是 EOL 则直接追加
    const isNewEOLOp = isEOLOp(newOp);
    const isLastEOLOp = isEOLOp(lastOp);
    if (isLastEOLOp) {
      lineState._appendLeaf(newLeaf);
      return lineState;
    }
    if (isNewEOLOp) {
      lineState._appendLeaf(newLeaf);
      // 1. Other 则为新 \n 2. This 则为原 \n
      const key = newLeaf.parent.key;
      lines.push(lineState);
      // this.key => 复用 other.key => 更新
      lineState.updateKey(key);
      lineState.updateLeaves();
      lineState.attributes = newOp.attributes || {};
      return LineState.create([], {}, this.block);
    }
    if (
      isObject<Op>(lastOp) &&
      isEqualAttributes(newOp.attributes, lastOp.attributes) &&
      isInsertOp(newOp) &&
      isInsertOp(lastOp)
    ) {
      // 合并相同属性的 insert
      const op: InsertOp = { insert: lastOp.insert + newOp.insert };
      if (isObject<AttributeMap>(newOp.attributes)) {
        op.attributes = newOp.attributes;
      }
      lineState.setLeaf(new LeafState(op, 0, lineState), index - 1);
      return lineState;
    }
    if (isInsertOp(newOp)) {
      lineState._appendLeaf(newLeaf);
    }
    return lineState;
  }

  /**
   * 组合 Ops
   */
  public compose(other: Delta): LineState[] {
    const lines: LineState[] = [];
    const otherOps = normalizeEOL(other.ops);
    const thisIter = new Iterator(this.lines);
    const otherIter = new OpIterator(otherOps);
    const firstOther = otherIter.peek();
    // 当前处理的 LineState
    let lineState = LineState.create([], {}, this.block);
    if (firstOther && isRetainOp(firstOther) && !firstOther.attributes) {
      let firstLeft = thisIter.firstRetain(firstOther.retain, lines);
      while (thisIter.peekType() === OP_TYPES.INSERT && thisIter.peekLength() <= firstLeft) {
        firstLeft = firstLeft - thisIter.peekLength();
        const leaf = thisIter.next();
        if (!leaf) continue;
        // 初始行数据在 thisIter.firstRetain 中处理完成
        // 其他 Op 则可直接追加到当前处理的 LineState
        lineState._appendLeaf(leaf);
      }
      if (firstOther.retain - firstLeft > 0) {
        otherIter.next(firstOther.retain - firstLeft);
      }
    }
    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (otherIter.peekType() === OP_TYPES.INSERT) {
        const leaf = new LeafState(otherIter.next(), 0, lineState);
        lineState = this.insert(lines, lineState, leaf);
        continue;
      }
      const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
      const thisLeaf = thisIter.next(length);
      const otherOp = otherIter.next(length);
      // 1. 预设 retain 2. Infinity
      if (isRetainOp(otherOp)) {
        let newLeaf = thisLeaf;
        if (!thisLeaf || !newLeaf) {
          continue;
        }
        if (otherOp.attributes) {
          const attrs = composeAttributes(thisLeaf.op.attributes, otherOp.attributes);
          const newOp = cloneOp(thisLeaf.op);
          newOp.attributes = attrs || {};
          newLeaf = LeafState.create(newOp, 0, thisLeaf.parent);
        }
        lineState = this.insert(lines, lineState, newLeaf);
        if (!otherIter.hasNext() && newLeaf === thisLeaf) {
          // 处理剩余的 Leaves 和 Lines
          const rest = thisIter.rest();
          for (const leaf of rest.leaf) {
            lineState = this.insert(lines, lineState, leaf);
          }
          lines.push(...rest.line);
          return lines;
        }
      }
    }
    return lines;
  }
}
