import { isNumber, isObject, isString } from "blocks-kit-utils";
import diff from "fast-diff";

import { composeAttributes } from "../attributes/compose";
import { diffAttributes } from "../attributes/diff";
import type { AttributeMap } from "../attributes/interface";
import { invertAttributes } from "../attributes/invert";
import { transformAttributes } from "../attributes/transform";
import { cloneOp } from "../utils/clone";
import { isEqualAttributes, isEqualOp } from "../utils/equal";
import type { Op } from "./interface";
import { OP_TYPES } from "./interface";
import { getOpLength, isDeleteOp, isInsertOp, isRetainOp, iterator } from "./op";

const NULL_CHARACTER = String.fromCharCode(0); // Placeholder char for embed in diff()

export class AbstractDelta {
  public ops: Op[];

  constructor(ops?: Op[] | { ops: Op[] }) {
    // Assume we are given a well formed ops
    if (Array.isArray(ops)) {
      this.ops = ops;
    } else if (ops && Array.isArray(ops.ops)) {
      this.ops = ops.ops;
    } else {
      this.ops = [];
    }
  }

  insert(arg: string, attributes?: AttributeMap): this {
    const newOp: Op = {};
    if (isString(arg) && arg.length === 0) {
      return this;
    }
    newOp.insert = arg;
    if (isObject<AttributeMap>(attributes) && Object.keys(attributes).length > 0) {
      newOp.attributes = attributes;
    }
    return this.push(newOp);
  }

  delete(length: number): this {
    if (length <= 0) {
      return this;
    }
    return this.push({ delete: length });
  }

  retain(length: number, attributes?: AttributeMap): this {
    if (length <= 0) {
      return this;
    }
    const newOp: Op = { retain: length };
    if (isObject(attributes) && Object.keys(attributes).length > 0) {
      newOp.attributes = attributes;
    }
    return this.push(newOp);
  }

  push(newOp: Op): this {
    let index = this.ops.length;
    let lastOp = this.ops[index - 1];
    newOp = cloneOp(newOp);
    if (isObject<Op>(lastOp)) {
      if (isDeleteOp(newOp) && isDeleteOp(lastOp)) {
        this.ops[index - 1] = { delete: lastOp.delete + newOp.delete };
        return this;
      }
      // Since it does not matter if we insert before or after deleting at the same index,
      // always prefer to insert first
      if (isDeleteOp(lastOp) && isInsertOp(newOp)) {
        index -= 1;
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

  chop(): this {
    const lastOp = this.ops[this.ops.length - 1];
    if (lastOp && lastOp.retain && !lastOp.attributes) {
      this.ops.pop();
    }
    return this;
  }

  filter(predicate: (op: Op, index: number) => boolean): Op[] {
    return this.ops.filter(predicate);
  }

  forEach(predicate: (op: Op, index: number) => void): void {
    this.ops.forEach(predicate);
  }

  map<T>(predicate: (op: Op, index: number) => T): T[] {
    return this.ops.map(predicate);
  }

  partition(predicate: (op: Op) => boolean): [Op[], Op[]] {
    const passed: Op[] = [];
    const failed: Op[] = [];
    this.forEach(op => {
      const target = predicate(op) ? passed : failed;
      target.push(op);
    });
    return [passed, failed];
  }

  reduce<T>(predicate: (acc: T, cur: Op, index: number) => T, initialValue: T): T {
    return this.ops.reduce(predicate, initialValue);
  }

  changeLength(): number {
    return this.reduce((length, elem) => {
      if (elem.insert) {
        return length + getOpLength(elem);
      } else if (elem.delete) {
        return length - elem.delete;
      }
      return length;
    }, 0);
  }

  length(): number {
    return this.reduce((length, elem) => {
      return length + getOpLength(elem);
    }, 0);
  }

  slice(start = 0, end = Infinity): AbstractDelta {
    const ops = [];
    const iter = iterator(this.ops);
    let index = 0;
    while (index < end && iter.hasNext()) {
      let nextOp;
      if (index < start) {
        nextOp = iter.next(start - index);
      } else {
        nextOp = iter.next(end - index);
        ops.push(nextOp);
      }
      index += getOpLength(nextOp);
    }
    return new AbstractDelta(ops);
  }

  compose(other: AbstractDelta): AbstractDelta {
    const thisIter = iterator(this.ops);
    const otherIter = iterator(other.ops);
    const ops = [];
    const firstOther = otherIter.peek();
    if (firstOther && isRetainOp(firstOther) && !firstOther.attributes) {
      let firstLeft = firstOther.retain;
      while (thisIter.peekType() === OP_TYPES.INSERT && thisIter.peekLength() <= firstLeft) {
        firstLeft -= thisIter.peekLength();
        ops.push(thisIter.next());
      }
      if (firstOther.retain - firstLeft > 0) {
        otherIter.next(firstOther.retain - firstLeft);
      }
    }
    const delta = new AbstractDelta(ops);
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
          const newOp: Op = {};
          if (isRetainOp(thisOp)) {
            newOp.retain = length;
          } else {
            newOp.insert = thisOp.insert;
          }
          // Preserve null when composing with a retain, otherwise remove it for inserts
          const attributes = composeAttributes(
            thisOp.attributes,
            otherOp.attributes,
            isRetainOp(thisOp)
          );
          if (attributes) {
            newOp.attributes = attributes;
          }
          delta.push(newOp);

          // Optimization if rest of other is just retain
          if (!otherIter.hasNext() && isEqualOp(delta.ops[delta.ops.length - 1], newOp)) {
            const rest = new AbstractDelta(thisIter.rest());
            return delta.concat(rest).chop();
          }

          // Other op should be delete, we could be an insert or retain
          // Insert + delete cancels out
        } else if (isDeleteOp(otherOp) && isRetainOp(thisOp)) {
          delta.push(otherOp);
        }
      }
    }
    return delta.chop();
  }

  concat(other: AbstractDelta): AbstractDelta {
    const delta = new AbstractDelta(this.ops.slice());
    if (other.ops.length > 0) {
      delta.push(other.ops[0]);
      delta.ops = delta.ops.concat(other.ops.slice(1));
    }
    return delta;
  }

  diff(other: AbstractDelta, cursor?: number | diff.CursorInfo): AbstractDelta {
    if (this.ops === other.ops) {
      return new AbstractDelta();
    }
    const strings = [this, other].map(delta => {
      return delta
        .map(op => {
          if (op.insert) {
            return isInsertOp(op) ? op.insert : NULL_CHARACTER;
          }
          const prep = delta === other ? "on" : "with";
          throw new Error("diff() called " + prep + " non-document");
        })
        .join("");
    });
    const retDelta = new AbstractDelta();
    // Parameter `cleanup` help maintain semantics
    // May incur some computational performance loss
    const diffResult = diff(strings[0], strings[1], cursor, true);
    const thisIter = iterator(this.ops);
    const otherIter = iterator(other.ops);
    diffResult.forEach((component: diff.Diff) => {
      let length = component[1].length;
      while (length > 0) {
        let opLength = 0;
        switch (component[0]) {
          case diff.INSERT: {
            opLength = Math.min(otherIter.peekLength(), length);
            retDelta.push(otherIter.next(opLength));
            break;
          }
          case diff.DELETE: {
            opLength = Math.min(length, thisIter.peekLength());
            thisIter.next(opLength);
            retDelta.delete(opLength);
            break;
          }
          case diff.EQUAL: {
            opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
            const thisOp = thisIter.next(opLength);
            const otherOp = otherIter.next(opLength);
            if (thisOp.insert === otherOp.insert) {
              retDelta.retain(opLength, diffAttributes(thisOp.attributes, otherOp.attributes));
            } else {
              retDelta.push(otherOp).delete(opLength);
            }
            break;
          }
        }
        length -= opLength;
      }
    });
    return retDelta.chop();
  }

  eachLine(
    predicate: (line: AbstractDelta, attributes: AttributeMap, index: number) => boolean | void,
    newline = "\n"
  ): void {
    const iter = iterator(this.ops);
    let line = new AbstractDelta();
    let i = 0;
    while (iter.hasNext()) {
      if (iter.peekType() !== OP_TYPES.INSERT) {
        return;
      }
      const thisOp = iter.peek();
      const start = getOpLength(thisOp) - iter.peekLength();
      const index = isInsertOp(thisOp) ? thisOp.insert.indexOf(newline, start) - start : -1;
      if (index < 0) {
        line.push(iter.next());
      } else if (index > 0) {
        line.push(iter.next(index));
      } else {
        if (predicate(line, iter.next(1).attributes || {}, i) === false) {
          return;
        }
        i += 1;
        line = new AbstractDelta();
      }
    }
    if (line.length() > 0) {
      predicate(line, {}, i);
    }
  }

  invert(base: AbstractDelta): AbstractDelta {
    const inverted = new AbstractDelta();
    this.reduce((baseIndex, op) => {
      if (op.insert) {
        inverted.delete(getOpLength(op));
      } else if (op.retain && !op.attributes) {
        inverted.retain(op.retain);
        return baseIndex + op.retain;
      } else if (op.delete || (op.retain && op.attributes)) {
        const length = (op.delete || op.retain) as number;
        const slice = base.slice(baseIndex, baseIndex + length);
        slice.forEach(baseOp => {
          if (op.delete) {
            inverted.push(baseOp);
          } else if (op.retain && op.attributes) {
            inverted.retain(
              getOpLength(baseOp),
              invertAttributes(op.attributes, baseOp.attributes)
            );
          }
        });
        return baseIndex + length;
      }
      return baseIndex;
    }, 0);
    return inverted.chop();
  }

  transform(index: number, priority?: boolean): number;
  transform(other: AbstractDelta, priority?: boolean): AbstractDelta;
  transform(arg: number | AbstractDelta, priority?: boolean): typeof arg;
  transform(arg: number | AbstractDelta, priority = false): typeof arg {
    priority = !!priority;
    if (isNumber(arg)) {
      return this.transformPosition(arg, priority);
    }
    const other: AbstractDelta = arg;
    const thisIter = iterator(this.ops);
    const otherIter = iterator(other.ops);
    const delta = new AbstractDelta();
    while (thisIter.hasNext() || otherIter.hasNext()) {
      if (
        thisIter.peekType() === OP_TYPES.INSERT &&
        (priority || otherIter.peekType() !== OP_TYPES.INSERT)
      ) {
        delta.retain(getOpLength(thisIter.next()));
      } else if (otherIter.peekType() === OP_TYPES.INSERT) {
        delta.push(otherIter.next());
      } else {
        const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
        const thisOp = thisIter.next(length);
        const otherOp = otherIter.next(length);
        if (thisOp.delete) {
          // Our delete either makes their delete redundant or removes their retain
          continue;
        } else if (otherOp.delete) {
          delta.push(otherOp);
        } else {
          // We retain either their retain or insert
          delta.retain(
            length,
            transformAttributes(thisOp.attributes, otherOp.attributes, priority)
          );
        }
      }
    }
    return delta.chop();
  }

  transformPosition(index: number, priority = false): number {
    priority = !!priority;
    const thisIter = iterator(this.ops);
    let offset = 0;
    while (thisIter.hasNext() && offset <= index) {
      const length = thisIter.peekLength();
      const nextType = thisIter.peekType();
      thisIter.next();
      if (nextType === OP_TYPES.DELETE) {
        index -= Math.min(length, index - offset);
        continue;
      } else if (nextType === OP_TYPES.INSERT && (offset < index || !priority)) {
        index += length;
      }
      offset += length;
    }
    return index;
  }
}
