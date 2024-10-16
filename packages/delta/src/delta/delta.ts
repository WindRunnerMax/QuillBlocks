import { isObject, isString } from "block-kit-utils";
import diff from "fast-diff";

import { composeAttributes } from "../attributes/compose";
import { diffAttributes } from "../attributes/diff";
import type { AttributeMap } from "../attributes/interface";
import { invertAttributes } from "../attributes/invert";
import { transformAttributes } from "../attributes/transform";
import { cloneOp } from "../utils/clone";
import { isEqualAttributes, isEqualOp } from "../utils/equal";
import type { Op, Ops } from "./interface";
import { EOL, OP_TYPES } from "./interface";
import { iterator } from "./iterator";
import { getOpLength, isDeleteOp, isInsertOp, isRetainOp } from "./op";

// Placeholder char for embed in diff()
const NULL_CHARACTER = String.fromCharCode(0);

export class Delta {
  public ops: Op[];

  constructor(ops?: Op[] | { ops: Op[] }) {
    if (Array.isArray(ops)) {
      this.ops = ops;
    } else if (ops && Array.isArray(ops.ops)) {
      this.ops = ops.ops;
    } else {
      this.ops = [];
    }
  }

  /**
   * 插入操作
   * @param insert
   * @param attributes
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#insert
   */
  public insert(insert: string, attributes?: AttributeMap): this {
    const newOp: Op = {};
    if (isString(insert) && insert.length === 0) {
      return this;
    }
    newOp.insert = insert;
    if (isObject<AttributeMap>(attributes) && Object.keys(attributes).length > 0) {
      newOp.attributes = attributes;
    }
    return this.push(newOp);
  }

  /**
   * 删除操作
   * @param length
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#delete
   */
  public delete(length: number): this {
    if (length <= 0) {
      return this;
    }
    return this.push({ delete: length });
  }

  /**
   * 保留操作
   * @param length
   * @param attributes
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#retain
   */
  public retain(length: number, attributes?: AttributeMap): this {
    if (length <= 0) {
      return this;
    }
    const newOp: Op = { retain: length };
    if (isObject(attributes) && Object.keys(attributes).length > 0) {
      newOp.attributes = attributes;
    }
    return this.push(newOp);
  }

  /**
   * 应用 Op
   * @param newOp
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#push
   */
  public push(newOp: Op): this {
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
   * 裁剪末尾 Ops
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#chop
   */
  public chop(): this {
    const lastOp = this.ops[this.ops.length - 1];
    if (lastOp && lastOp.retain && !lastOp.attributes) {
      this.ops.pop();
    }
    return this;
  }

  /**
   * 过滤符合条件的 Ops
   * @param predicate
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#filter
   */
  public filter(predicate: (op: Op, index: number) => boolean): Op[] {
    return this.ops.filter(predicate);
  }

  /**
   * 迭代 Ops
   * @param predicate
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#foreach
   */
  public forEach(predicate: (op: Op, index: number) => void): void {
    this.ops.forEach(predicate);
  }

  /**
   * 转换 Ops
   * @param predicate
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#map
   */
  public map<T>(predicate: (op: Op, index: number) => T): T[] {
    return this.ops.map(predicate);
  }

  /**
   * 分组 Ops
   * @param predicate
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#partition
   */
  public partition(predicate: (op: Op) => boolean): [Op[], Op[]] {
    const passed: Op[] = [];
    const failed: Op[] = [];
    this.forEach(op => {
      const target = predicate(op) ? passed : failed;
      target.push(op);
    });
    return [passed, failed];
  }

  /**
   * Reduce Ops
   * @param predicate
   * @param initialValue
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#reduce
   */
  public reduce<T>(predicate: (acc: T, cur: Op, index: number) => T, initialValue: T): T {
    return this.ops.reduce(predicate, initialValue);
  }

  /**
   * 获取应用后的 Ops 长度
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#changelength
   */
  public changeLength(): number {
    return this.reduce((length, elem) => {
      if (elem.insert) {
        return length + getOpLength(elem);
      } else if (elem.delete) {
        return length - elem.delete;
      }
      return length;
    }, 0);
  }

  /**
   * 获取 Ops 总长度 [内容长度]
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#length
   */
  public length(): number {
    return this.reduce((length, elem) => {
      return length + getOpLength(elem);
    }, 0);
  }

  /**
   * 切片 Ops
   * @param start
   * @param end
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#slice
   */
  public slice(start = 0, end = Infinity): Delta {
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
      index = index + getOpLength(nextOp);
    }
    return new Delta(ops);
  }

  /**
   * 组合 Ops
   * @param other
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#compose
   */
  public compose(other: Delta): Delta {
    const thisIter = iterator(this.ops);
    const otherIter = iterator(other.ops);
    const ops: Ops = [];
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
    const delta = new Delta(ops);
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
            const rest = new Delta(thisIter.rest());
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

  /**
   * 拼接 Ops
   * @param other
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#concat
   */
  public concat(other: Delta): Delta {
    const delta = new Delta(this.ops.slice());
    if (other.ops.length > 0) {
      delta.push(other.ops[0]);
      delta.ops = delta.ops.concat(other.ops.slice(1));
    }
    return delta;
  }

  /**
   * Diff Ops
   * @param other
   * @param cursor
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#diff
   */
  public diff(other: Delta, cursor?: number | diff.CursorInfo): Delta {
    if (this.ops === other.ops) {
      return new Delta();
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
    const retDelta = new Delta();
    const diffResult = diff(strings[0], strings[1], cursor, true);
    const thisIter = iterator(this.ops);
    const otherIter = iterator(other.ops);
    diffResult.forEach((component: diff.Diff) => {
      // 当前 diff 块长度
      let length = component[1].length;
      while (length > 0) {
        // 本次循环将要处理的长度
        let opLength = 0;
        switch (component[0]) {
          case diff.INSERT: {
            // 取 iter2 当前 op 剩下可以处理的长度 / diff 块还未处理的长度 中的较小值
            opLength = Math.min(otherIter.peekLength(), length);
            // 取出 opLength 长度的 op 并置入目标 delta, iter2 移动 offset/index 指针
            retDelta.push(otherIter.next(opLength));
            break;
          }
          case diff.DELETE: {
            // 取 diff 块还未处理的长度 / iter1 当前 op 剩下可以处理的长度 中的较小值
            opLength = Math.min(length, thisIter.peekLength());
            // iter1 移动 offset/index 指针
            thisIter.next(opLength);
            // 目标 delta 需要删除的长度
            retDelta.delete(opLength);
            break;
          }
          case diff.EQUAL: {
            // 取 diff 块还未处理的长度 / iter1 当前 op 剩下可以处理的长度 / iter2 当前 op 剩下可以处理的长度 中的较小值
            opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
            // 取出 opLength 长度的 op1, iter1 移动 offset/index 指针
            const thisOp = thisIter.next(opLength);
            // 取出 opLength 长度的 op2, iter2 移动 offset/index 指针
            const otherOp = otherIter.next(opLength);
            // 如果两个 op 的 insert 相同
            if (thisOp.insert === otherOp.insert) {
              // 直接将 opLength 长度的 attributes diff 置入
              retDelta.retain(opLength, diffAttributes(thisOp.attributes, otherOp.attributes));
            } else {
              // 直接将 op2 置入目标 delta 并删除 op1  兜底策略
              retDelta.push(otherOp).delete(opLength);
            }
            break;
          }
        }
        // 当前 diff 块剩余长度 = 当前 diff 块长度 - 本次循环处理的长度
        length = length - opLength;
      }
    });
    return retDelta.chop();
  }

  /**
   * 按行迭代 Ops
   * @param predicate
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#eachline
   * @note 迭代的行 Delta 会携带 LF-Op, 不存在则会自动补充
   */
  public eachLine(
    predicate: (line: Delta, attributes: AttributeMap, index: number) => boolean | void
  ): void {
    const iter = iterator(this.ops);
    let line = new Delta();
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
        line.ops.push(nextOp);
        if (predicate(line, nextOp.attributes || {}, i) === false) {
          return;
        }
        i = i + 1;
        line = new Delta();
      }
    }
    if (line.length() > 0) {
      line.ops.push({ insert: EOL });
      predicate(line, {}, i);
    }
  }

  /**
   * 反转增量 invert
   * @param base
   * @example inverted = delta.invert(base)
   * @example base.compose(delta).compose(inverted) === base
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#invert
   */
  public invert(base: Delta): Delta {
    const inverted = new Delta();
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

  /**
   * 操作变换
   * @param other 操作变换目标
   * @param priority true: this > other false: other > this
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#transform
   * @usage User: A [uid:1] B [uid:2] Base: i("12") Priority: A > B
   * - oa=r(2).i("A") 12A ob1=oa.transform(ob, true)=r(3).i("B") 12AB
   * - ob=r(2).i("B") 12B oa1=ob.transform(oa, false)=r(2).i("A") 12AB
   */
  public transform(other: Delta, priority = false): Delta {
    priority = !!priority;
    const thisIter = iterator(this.ops);
    const otherIter = iterator(other.ops);
    const delta = new Delta();
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

  /**
   * 操作变换指针
   * @param index index to transform
   * @param priority true: this > other false: other > this
   * @link https://www.npmjs.com/package/quill-delta/v/4.2.2#transformposition
   */
  public transformPosition(index: number, priority = false): number {
    priority = !!priority;
    const thisIter = iterator(this.ops);
    let offset = 0;
    while (thisIter.hasNext() && offset <= index) {
      const length = thisIter.peekLength();
      const nextType = thisIter.peekType();
      thisIter.next();
      if (nextType === OP_TYPES.DELETE) {
        index = index - Math.min(length, index - offset);
        continue;
      } else if (nextType === OP_TYPES.INSERT && (offset < index || !priority)) {
        index = index + length;
      }
      offset = offset + length;
    }
    return index;
  }
}
