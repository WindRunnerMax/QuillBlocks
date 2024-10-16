import type { AttributeMap } from "block-kit-delta";
import type { Op } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import { isInsertOp } from "block-kit-delta";

import { Key } from "../utils/key";
import type { BlockState } from "./block-state";
import { LeafState } from "./leaf-state";

export class LineState {
  /** 唯一 key */
  public key: string;
  /** 行 Leaf 数量 */
  public size: number;
  /** 行起始偏移 */
  public start: number;
  /** 行号索引 */
  public index: number;
  /** 行文本总宽度 */
  public length: number;
  /** 标记更新子节点 */
  public isDirty = false;
  /** Leaf 节点 */
  private leaves: LeafState[] = [];

  constructor(
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
    this.size = 0;
    this.length = 0;
    this._deltaToLeaves(delta);
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
   * 获取行内最后一个节点
   */
  public getLastLeaf(): LeafState | null {
    const leaves = this.getLeaves();
    return leaves[leaves.length - 1] || null;
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
      offset = offset + leaf.length;
      leaf.parent = this;
    });
    this.length = offset;
    this.isDirty = false;
    this.size = this.leaves.length;
    return offset;
  }

  /**
   * 通过 Leaves 获取行 Ops
   */
  public getOps() {
    return this.leaves.map(leaf => leaf.op);
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
   * 强制刷新行 key
   */
  public forceRefresh() {
    this.key = Key.refresh(this);
  }

  /**
   * 强制刷新行 key
   * @param key
   */
  public updateKey(key: string) {
    this.key = key;
    Key.update(this, key);
  }

  /**
   * 重设内建 Delta
   * @param delta
   * @note 仅编辑器内部使用, 需要保证自建 Leaves
   */
  public _setDelta(delta: Delta) {
    this.delta = delta;
  }

  /**
   * 追加 LeafState
   * @param delta
   * @note 仅编辑器内部使用
   */
  public _appendLeaf(leaf: LeafState) {
    leaf.index = this.size;
    leaf.offset = this.length;
    this.leaves.push(leaf);
    this.size++;
    this.length = this.length + leaf.length;
  }

  /**
   * 通过 delta 创建 Leaves
   * @note 仅编辑器内部使用
   */
  public _deltaToLeaves(delta: Delta) {
    const iterator = { index: 0, offset: 0 };
    for (const op of delta.ops) {
      if (!isInsertOp(op) || !op.insert.length) {
        this.parent.editor.logger.warning("Invalid op in line", op);
        iterator.index = iterator.index + 1;
        continue;
      }
      const leaf = new LeafState(iterator.index, iterator.offset, op, this);
      this.leaves.push(leaf);
      iterator.index = iterator.index + 1;
      iterator.offset = iterator.offset + op.insert.length;
    }
    this.length = iterator.offset;
    this.size = this.leaves.length;
  }

  /**
   * 创建 LineState
   */
  public static create(ops: Op[], attributes: AttributeMap, block: BlockState) {
    return new LineState(new Delta(ops), attributes, block);
  }
}