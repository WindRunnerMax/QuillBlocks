import { isObject } from "block-kit-utils";

import { composeAttributes } from "../attributes/compose";
import type { AttributeMap } from "../attributes/interface";
import { Delta } from "../delta/delta";
import type { Op } from "../delta/interface";
import { EOL, OP_TYPES } from "../delta/interface";
import { getOpLength, isDeleteOp, isInsertOp, isRetainOp } from "../delta/op";
import { isEOLOp, normalizeEOL } from "../utils/delta";
import { isEqualAttributes, isEqualOp } from "../utils/equal";
import { MutateIterator } from "./iterator";

export class MutateDelta extends Delta {
  constructor(ops: Op[]) {
    super(ops);
  }

  /**
   * Immutable Push
   * @param newOp
   */
  public push(newOp: Op): this {
    let index = this.ops.length;
    let lastOp = this.ops[index - 1];
    // 如果是 EOL 则直接追加
    if (isEOLOp(newOp) || isEOLOp(lastOp)) {
      this.ops.push(newOp);
      return this;
    }
    if (isObject<Op>(lastOp)) {
      if (isDeleteOp(newOp) && isDeleteOp(lastOp)) {
        this.ops[index - 1] = { delete: lastOp.delete + newOp.delete };
        return this;
      }
      if (isDeleteOp(lastOp) && isInsertOp(newOp)) {
        index = index - 1;
        lastOp = this.ops[index - 1];
        if (!isObject(lastOp)) {
          this.ops.unshift(newOp);
          return this;
        }
      }
      if (isEqualAttributes(newOp.attributes, (lastOp as Op).attributes)) {
        if (isInsertOp(newOp) && isInsertOp(lastOp)) {
          this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
          if (isObject<AttributeMap>(newOp.attributes)) {
            this.ops[index - 1].attributes = newOp.attributes;
          }
          return this;
        } else if (isRetainOp(newOp) && isRetainOp(lastOp)) {
          this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
          if (isObject<AttributeMap>(newOp.attributes)) {
            this.ops[index - 1].attributes = newOp.attributes;
          }
          return this;
        }
      }
    }
    if (index === this.ops.length) {
      this.ops.push(newOp);
    } else {
      this.ops.splice(index, 0, newOp);
    }
    return this;
  }

  /**
   * Immutable Compose
   * @param Delta
   */
  public compose(other: Delta) {
    other.ops = normalizeEOL(other.ops);
    const thisIter = new MutateIterator(this.ops);
    const otherIter = new MutateIterator(other.ops);
    const ops: Op[] = [];
    const firstOther = otherIter.peek();
    if (firstOther && isRetainOp(firstOther) && !firstOther.attributes) {
      let firstLeft = firstOther.retain;
      while (thisIter.peekType() === OP_TYPES.INSERT && thisIter.peekLength() <= firstLeft) {
        firstLeft = firstLeft - thisIter.peekLength();
        ops.push(thisIter.next());
      }
      if (firstOther.retain - firstLeft > 0) {
        otherIter.next(firstOther.retain - firstLeft);
      }
    }
    const delta = new MutateDelta(ops);
    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (otherIter.peekType() === OP_TYPES.INSERT) {
        delta.push(otherIter.next());
      } else if (thisIter.peekType() === OP_TYPES.DELETE) {
        delta.push(thisIter.next());
      } else {
        const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
        const thisOp = thisIter.next(length);
        const otherOp = otherIter.next(length);
        if (isRetainOp(otherOp)) {
          let newOp: Op = {};
          if (isRetainOp(thisOp)) {
            newOp.retain = length;
          } else {
            // 此处为 InsertOp 直接改变其引用保证 Immutable
            newOp = thisOp;
          }
          const attributes = composeAttributes(
            thisOp.attributes,
            otherOp.attributes,
            isRetainOp(thisOp)
          );
          if (attributes) {
            newOp.attributes = attributes;
          }
          delta.push(newOp);
          if (!otherIter.hasNext() && isEqualOp(this.ops[this.ops.length - 1], newOp)) {
            delta.ops.push(...thisIter.rest());
            return delta;
          }
        } else if (isDeleteOp(otherOp) && isRetainOp(thisOp)) {
          delta.push(otherOp);
        }
      }
    }
    return delta;
  }

  /**
   * Immutable EachLine
   * @param predicate
   * @note 迭代的行 Delta 不会携带 LF Op
   */
  public eachLine(
    predicate: (line: Delta, attributes: AttributeMap, index: number) => boolean | void
  ): void {
    const iter = new MutateIterator(this.ops);
    let line: Op[] = [];
    let i = 0;
    while (iter.hasNext()) {
      if (iter.peekType() !== OP_TYPES.INSERT) {
        return;
      }
      const thisOp = iter.peek();
      const start = getOpLength(thisOp) - iter.peekLength();
      const index = isInsertOp(thisOp) ? thisOp.insert.indexOf(EOL, start) - start : -1;
      if (index < 0) {
        line.push(iter.next());
      } else if (index > 0) {
        line.push(iter.next(index));
      } else {
        const nextOp = iter.next(1);
        line.push(nextOp);
        const delta = new Delta(line);
        if (predicate(delta, nextOp.attributes || {}, i) === false) {
          return;
        }
        i = i + 1;
        line = [];
      }
    }
    if (line.length > 0) {
      line.push({ insert: EOL });
      const delta = new Delta(line);
      predicate(delta, {}, i);
    }
  }
}
