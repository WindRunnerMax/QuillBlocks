import { getId } from "block-kit-utils";

import { Delta } from "../delta/delta";
import { cloneOps } from "../utils/clone";
import type { BlockDeltaOption } from "./interface";
import { BLOCK_TYPE } from "./interface";

export class BlockDelta extends Delta {
  /** Block 标识 */
  public readonly blockId: string;
  /** Block 类型 */
  public readonly blockType: string;

  /**
   * 构造函数
   * @param options
   */
  constructor(options?: BlockDeltaOption) {
    const { ops = [], blockId = getId(), blockType = BLOCK_TYPE.C } = options || {};
    super(ops);
    this.blockId = blockId;
    this.blockType = blockType;
  }

  /**
   * 切片
   * @param start
   * @param end
   * @returns
   */
  public slice(start = 0, end = Infinity): BlockDelta {
    const delta = super.slice(start, end);
    return BlockDelta.create(this, delta);
  }

  /**
   * 组合
   * @param other
   * @returns
   */
  public compose(other: Delta): BlockDelta {
    const delta = super.compose(other);
    return BlockDelta.create(this, delta);
  }

  /**
   * 连接
   * @param other
   */
  public concat(other: Delta): BlockDelta {
    const delta = super.concat(other);
    return BlockDelta.create(this, delta);
  }

  /**
   * 反转
   * @param base
   */
  public invert(base: Delta): BlockDelta {
    const delta = super.invert(base);
    return BlockDelta.create(this, delta);
  }

  /**
   * 变换
   * @param delta
   * @param priority
   */
  public transform(base: Delta, priority = false): Delta {
    const delta = super.transform(base, priority);
    return BlockDelta.create(this, delta);
  }

  /**
   * 变换位置
   * @param index
   * @param priority
   */
  public transformPosition(base: number, priority = false): number {
    const index = super.transformPosition(base, priority);
    return index;
  }

  /**
   * 以 base 和 delta 为基础创建新的 BlockDelta
   * @param base
   * @param delta
   */
  public static create(base: BlockDelta, delta: Delta) {
    const { ops } = delta;
    const { blockId, blockType } = base;
    return new BlockDelta({ ops, blockId, blockType });
  }

  /**
   * 克隆
   * @param deep 是否深克隆
   */
  public clone(deep?: boolean): BlockDelta {
    return new BlockDelta({
      blockId: this.blockId,
      blockType: this.blockType,
      ops: deep ? cloneOps(this.ops) : this.ops,
    });
  }
}
