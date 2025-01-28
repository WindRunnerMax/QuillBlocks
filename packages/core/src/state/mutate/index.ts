import type { AttributeMap, Delta, Op } from "block-kit-delta";
import type { InsertOp } from "block-kit-delta";
import {
  cloneOp,
  composeAttributes,
  EOL_OP,
  isDeleteOp,
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
  /** 插入的 ops */
  public inserts: InsertOp[];
  /** 修改的 ops */
  public revises: InsertOp[];
  /** 删除的 ops */
  public deletes: InsertOp[];
  /** 初始 Lines */
  public lines: LineState[];
  /** 新的 Lines */
  public newLines: LineState[];

  /**
   * 构造函数
   * @param block
   */
  constructor(protected block: BlockState) {
    this.inserts = [];
    this.deletes = [];
    this.revises = [];
    this.newLines = [];
    this.lines = block.getLines();
  }

  /**
   * 在 LineState 插入 Leaf
   * @param lineState
   * @param newLeaf
   */
  protected insert(lineState: LineState, newLeaf: LeafState): LineState {
    const leaves = lineState.getLeaves();
    const index = leaves.length;
    const lastLeaf = lineState.getLastLeaf();
    const lastOp = lastLeaf && lastLeaf.op;
    const newOp = newLeaf.op;
    // 如果 NewOp/LastOp 是 EOL 则会调度追加
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
      this.newLines.push(lineState);
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
      if (isObject<AttributeMap>(lastOp.attributes)) {
        op.attributes = lastOp.attributes;
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
   * @param other
   */
  public compose(other: Delta): LineState[] {
    this.inserts = [];
    this.deletes = [];
    this.revises = [];
    this.newLines = [];
    const otherOps = normalizeEOL(other.ops);
    const thisIter = new Iterator(this.lines);
    const otherIter = new OpIterator(otherOps);
    const firstOther = otherIter.peek();
    // 当前处理的 LineState
    let lineState = LineState.create([], {}, this.block);
    if (firstOther && isRetainOp(firstOther) && !firstOther.attributes) {
      let firstLeft = thisIter.firstRetain(firstOther.retain, this.newLines);
      while (thisIter.peekType() === OP_TYPES.INSERT && thisIter.peekLength() <= firstLeft) {
        firstLeft = firstLeft - thisIter.peekLength();
        const leaf = thisIter.next();
        if (!leaf) continue;
        // 初始行数据在 thisIter.firstRetain 中处理完成
        // 其他 Op 则可直接追加到当前处理的 LineState
        lineState._appendLeaf(leaf);
      }
      if (firstOther.retain - firstLeft > 0) {
        // 若处理过的数据 > 0, 将 OtherIter 的指针前移
        otherIter.next(firstOther.retain - firstLeft);
      }
    }
    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (otherIter.peekType() === OP_TYPES.INSERT) {
        const leaf = new LeafState(otherIter.next(), 0, lineState);
        lineState = this.insert(lineState, leaf);
        this.inserts.push(leaf.op as InsertOp);
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
          newOp.attributes = attrs;
          newLeaf = LeafState.create(newOp, 0, thisLeaf.parent);
          this.revises.push({ insert: newOp.insert!, attributes: otherOp.attributes });
        }
        lineState = this.insert(lineState, newLeaf);
        if (!otherIter.hasNext() && newLeaf === thisLeaf) {
          // 处理剩余的 Leaves 和 Lines
          const rest = thisIter.rest();
          for (const leaf of rest.leaf) {
            lineState = this.insert(lineState, leaf);
          }
          this.newLines.push(...rest.line);
          return this.newLines;
        }
        continue;
      }
      if (isDeleteOp(otherOp)) {
        thisLeaf && this.deletes.push(thisLeaf.op as InsertOp);
        continue;
      }
    }
    // 当行状态存在值或者当前没有行时, 补齐行数据内容
    if (lineState.getLeaves().length || !this.newLines.length) {
      this.insert(lineState, new LeafState(cloneOp(EOL_OP), 0, lineState));
    }
    return this.newLines;
  }
}
