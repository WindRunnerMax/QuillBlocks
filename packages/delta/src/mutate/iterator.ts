import type { Op } from "../delta/interface";
import { OP_TYPES } from "../delta/interface";
import { getOpLength, isDeleteOp, isInsertOp, isRetainOp } from "../delta/op";

export class MutateIterator {
  /** Ops 组 */
  protected ops: Op[];
  /** Op 索引 */
  protected index: number;
  /** Op 偏移 */
  protected offset: number;

  constructor(ops: Op[]) {
    this.ops = ops;
    this.index = 0;
    this.offset = 0;
  }

  /**
   * 判断是否存在 Next Op
   */
  public hasNext(): boolean {
    return this.peekLength() < Infinity;
  }

  /**
   * 获取 Next Op 的部分/全部内容
   * @param length
   */
  public next(length?: number): Op {
    if (!length) {
      length = Infinity;
    }
    const nextOp = this.ops[this.index];
    if (nextOp) {
      const offset = this.offset;
      const opLength = getOpLength(nextOp);
      const restLength = opLength - offset;
      if (length >= restLength) {
        length = restLength;
        this.index = this.index + 1;
        this.offset = 0;
      } else {
        this.offset = this.offset + length;
      }
      if (isDeleteOp(nextOp)) {
        // 剩余 OpLength 与 NextOp 相等 => Immutable
        if (nextOp.delete === length) {
          return nextOp;
        }
        return { delete: length };
      } else {
        const retOp: Op = {};
        if (nextOp.attributes) {
          retOp.attributes = nextOp.attributes;
        }
        if (isRetainOp(nextOp)) {
          // 剩余 OpLength 与 NextOp 相等 => Immutable
          if (nextOp.retain === length) {
            return nextOp;
          }
          retOp.retain = length;
        } else if (isInsertOp(nextOp)) {
          // 起始与裁剪位置等同 NextOp => Immutable
          if (offset === 0 && nextOp.insert.length <= length) {
            return nextOp;
          }
          retOp.insert = nextOp.insert.substr(offset, length);
        } else {
          return nextOp;
        }
        return retOp;
      }
    } else {
      return { retain: Infinity };
    }
  }

  /**
   * 获取当前正在迭代的 Op
   */
  public peek(): Op {
    return this.ops[this.index];
  }

  /**
   * 获取当前迭代 Op 的剩余长度
   */
  public peekLength(): number {
    if (this.ops[this.index]) {
      return getOpLength(this.ops[this.index]) - this.offset;
    } else {
      return Infinity;
    }
  }

  /**
   * 获取当前迭代 Op 的类型
   */
  public peekType(): string {
    if (this.ops[this.index]) {
      if (isDeleteOp(this.ops[this.index])) {
        return OP_TYPES.DELETE;
      } else if (isRetainOp(this.ops[this.index])) {
        return OP_TYPES.RETAIN;
      } else {
        return OP_TYPES.INSERT;
      }
    }
    return OP_TYPES.RETAIN;
  }

  /**
   * 获取剩余的所有 Ops
   */
  public rest(): Op[] {
    if (!this.hasNext()) {
      return [];
    } else if (this.offset === 0) {
      return this.ops.slice(this.index);
    } else {
      const offset = this.offset;
      const index = this.index;
      const next = this.next();
      const rest = this.ops.slice(this.index);
      this.offset = offset;
      this.index = index;
      return [next].concat(rest);
    }
  }
}
