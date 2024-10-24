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
    /** Op 起始偏移量 */
    public offset: number,
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
   * 将 LeafState 转换为 Range
   */
  public toRange() {
    const start = new Point(this.parent.index, this.offset);
    const end = new Point(this.parent.index, this.offset + this.length);
    return new Range(start, end);
  }

  /**
   * 创建 LeafState
   * @param op
   * @param index
   * @param offset
   * @param parent
   */
  public static create(op: Op, offset: number, parent: LineState) {
    return new LeafState(op, offset, parent);
  }
}
