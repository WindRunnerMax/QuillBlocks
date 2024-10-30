import type { Op } from "block-kit-delta";
import { EOL } from "block-kit-delta";

import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import type { LineState } from "./line-state";

export class LeafState {
  /** EOL 节点 */
  public readonly eol: boolean;
  /** Void 节点 */
  public readonly void: boolean;
  /** Block 节点 */
  public readonly block: boolean;
  /** Inline 节点 */
  public readonly inline: boolean;
  /** Op 长度 */
  public readonly length: number;

  constructor(
    /** Op 引用 */
    public op: Op,
    /** Op 索引 */
    public index: number,
    /** 父级 LineState */
    public parent: LineState
  ) {
    this.eol = false;
    this.eol = op.insert === EOL;
    const editor = parent.parent.editor;
    this.void = editor.schema.isVoid(op);
    this.block = editor.schema.isBlock(op);
    this.inline = editor.schema.isInline(op);
    this.length = op.insert ? op.insert.length : 0;
  }

  /**
   * 获取文本内容
   */
  public getText() {
    return this.op.insert || "";
  }

  /**
   * 获取前一个 LeafState
   * @param span 跨行
   */
  public prev(span = true) {
    const index = this.index;
    if (index > 0) {
      return this.parent.getLeaf(index - 1);
    }
    // index <=0 的情况下, 存在 span 跨行
    if (!span) return null;
    const prevLine = this.parent.prev();
    return prevLine ? prevLine.getLastLeaf() : null;
  }

  /**
   * 获取下一个 LeafState
   * @param span 跨行
   */
  public next(span = true) {
    const index = this.index;
    if (index < this.parent.size - 1) {
      return this.parent.getLeaf(index + 1);
    }
    // index >= line.size - 1 的情况下, 存在 span 跨行
    if (!span) return null;
    const nextLine = this.parent.next();
    return nextLine ? nextLine.getFirstLeaf() : null;
  }

  /**
   * 将 LeafState 转换为 Range
   */
  public toRange() {
    const start = new Point(this.parent.index, this.index, 0);
    const end = new Point(this.parent.index, this.index, this.length);
    return new Range(start, end);
  }

  /**
   * 创建 LeafState
   * @param op
   * @param index
   * @param index
   * @param parent
   */
  public static create(op: Op, index: number, parent: LineState) {
    return new LeafState(op, index, parent);
  }
}
