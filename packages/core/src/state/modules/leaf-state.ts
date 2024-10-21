import type { Op } from "block-kit-delta";

import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import { EOL } from "../types";
import type { LineState } from "./line-state";

export class LeafState {
  /** EOL 节点 */
  public readonly eol: boolean;
  /** Op 长度 */
  public readonly length: number;
  /** Void 节点 */
  public readonly void: boolean;
  /** Block 节点 */
  public readonly block: boolean;
  /** Inline 节点 */
  public readonly inline: boolean;

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
    this.length = op.insert ? op.insert.length : 0;
    this.void = parent.parent.editor.schema.isVoid(op);
    this.block = parent.parent.editor.schema.isBlock(op);
    this.inline = parent.parent.editor.schema.isInline(op);
  }

  /**
   * 获取文本内容
   */
  public getText() {
    return this.op.insert || "";
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

  /**
   * 将 LeafState 转换为 Range
   */
  public toRange() {
    const start = new Point(this.parent.index, this.offset);
    const end = new Point(this.parent.index, this.offset + this.length);
    return new Range(start, end);
  }
}
