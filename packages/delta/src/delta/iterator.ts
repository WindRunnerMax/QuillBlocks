import type { Op } from "./interface";
import { OP_TYPES } from "./interface";
import { getOpLength, isDeleteOp, isInsertOp, isRetainOp } from "./op";

export class OpIterator {
  /** Ops 组 */
  private ops: Op[];
  /** Op 索引 */
  private index: number;
  /** Op 偏移 */
  private offset: number;

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
      // 这里并不是不符合规则的数据要跳过迭代
      // 而是需要将当前 index 的 op insert 迭代完
      length = Infinity;
    }
    // 这里命名为 nextOp 实际指向的还是当前 index 的 op
    const nextOp = this.ops[this.index];
    if (nextOp) {
      // 暂存当前要处理的 insert 偏移量
      const offset = this.offset;
      const opLength = getOpLength(nextOp);
      const restLength = opLength - offset;
      // 如果需要处理的长度大于当前 Op 的剩余长度
      if (length >= restLength) {
        // 处理当前 Op 剩余的长度
        length = restLength;
        // 此时需要迭代到下一个 Op
        this.index = this.index + 1;
        // 重置索引偏移量
        this.offset = 0;
      } else {
        // 处理传入的 Length 长度的 Op
        this.offset = this.offset + length;
      }
      if (isDeleteOp(nextOp)) {
        return { delete: length };
      } else {
        const retOp: Op = {};
        // 处理当前 Op 携带的 Attributes
        if (nextOp.attributes) {
          retOp.attributes = nextOp.attributes;
        }
        if (isRetainOp(nextOp)) {
          retOp.retain = length;
        } else if (isInsertOp(nextOp)) {
          // 通过之前暂存的 Offset 以及计算的 Length 截取 Insert 字符串
          retOp.insert = nextOp.insert.substr(offset, length);
        } else {
          // offset should === 0, length should === 1
          retOp.insert = nextOp.insert;
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
      // Should never return 0 if our index is being managed correctly
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

export const iterator = (ops: Op[]): OpIterator => {
  return new OpIterator(ops);
};
