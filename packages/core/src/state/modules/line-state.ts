import type { AttributeMap, Delta } from "block-kit-delta";
import { isInsertOp } from "block-kit-delta";

import type { Editor } from "../../editor";
import { Key } from "../utils/key";
import type { BlockState } from "./block-state";
import { LeafState } from "./leaf-state";

export class LineState {
  /** 行宽度 */
  public size: number;
  /** 行起始偏移 */
  public start: number;
  /** 行号索引 */
  public index: number;
  /** 标记更新子节点 */
  public isDirty = false;
  /** 唯一 key */
  public readonly key: string;
  /** Leaf 节点 */
  private leaves: LeafState[] = [];

  constructor(
    /** Editor 实例 */
    private editor: Editor,
    /** Delta 数据 */
    public delta: Delta,
    /** 行属性 */
    public attributes: AttributeMap,
    /** 父级 BlockState */
    public readonly parent: BlockState
  ) {
    this.index = 0;
    this.start = 0;
    this.key = Key.getId(this);
    const iterator = { index: 0, offset: 0 };
    for (const op of delta.ops) {
      if (!isInsertOp(op) || !op.insert.length) {
        this.editor.logger.warning("Invalid op in line", op);
        iterator.index = iterator.index + 1;
        continue;
      }
      const leaf = new LeafState(iterator.index, iterator.offset, op, this);
      this.leaves.push(leaf);
      iterator.index = iterator.index + 1;
      iterator.offset = iterator.offset + op.insert.length;
    }
    this.size = iterator.offset;
  }

  /**
   * 获取行文本
   */
  public getText() {
    return this.leaves.map(leaf => leaf.getText()).join("");
  }

  /**
   * 获取 Leaf 节点
   * @param index
   */
  public getLeaf(index: number): LeafState | null {
    return this.leaves[index] || null;
  }

  /**
   * 设置 Leaf 节点
   */
  public setLeaf(node: LeafState, index: number) {
    if (this.leaves[index] === node) {
      return this;
    }
    this.isDirty = true;
    this.leaves[index] = node;
    return this;
  }

  /**
   * 获取行内所有 Leaf 节点
   */
  public getLeaves() {
    return this.leaves;
  }

  /**
   * 更新所有 Leaf 节点
   * @param leaves 叶子节点
   * @returns 行宽度
   */
  public updateLeaves(leaves?: LeafState[]) {
    if (leaves) {
      this.leaves = leaves;
    }
    let offset = 0;
    this.leaves.forEach((leaf, index) => {
      leaf.index = index;
      leaf.offset = offset;
      offset = offset + leaf.size;
      leaf.parent = this;
    });
    this.size = offset;
    this.isDirty = false;
    return offset;
  }

  /**
   * 获取行 Ops
   */
  public getOps() {
    return this.delta.ops;
  }

  /**
   * 获取行索引
   */
  public getIndex() {
    return this.index;
  }

  /**
   * 获取行属性
   */
  public getAttributes() {
    return this.attributes;
  }

  /**
   * 重设内建 Delta
   * @param delta
   * @note 仅编辑器内部使用, 需要保证自建 Leaves
   */
  public _setDelta(delta: Delta) {
    this.delta = delta;
  }
}
