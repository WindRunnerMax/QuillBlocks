import type { Op } from "block-kit-delta";
import type { InsertOp } from "block-kit-delta";
import { EOL } from "block-kit-delta";
import { isNil } from "block-kit-utils";

import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import type { LineState } from "./line-state";

export class LeafState {
  /** EOL 节点 */
  public readonly eol: boolean;
  /** Void 节点 */
  public readonly void: boolean;
  /** Embed 节点 */
  public readonly embed: boolean;
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
    this.embed = editor.schema.isEmbed(op);
    this.inline = editor.schema.isInline(op);
    this.length = op.insert ? op.insert.length : 0;
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      // 在开发模式和测试环境下冻结, 避免 immutable 的对象被修改
      Object.freeze(this.op);
      Object.freeze(this.op.attributes);
    }
  }

  /**
   * 获取文本内容
   */
  public getText() {
    return this.op.insert || "";
  }

  /**
   * 获取前一个 LeafState
   * @param span [?=true] 跨行
   */
  public prev(span = true) {
    const index = this.parent._leafToIndex.get(this);
    if (isNil(index)) return null;
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
   * @param span [?=true] 跨行
   */
  public next(span = true) {
    const index = this.parent._leafToIndex.get(this);
    if (isNil(index)) return null;
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
    const start = new Point(this.parent.index, this.offset);
    const end = new Point(this.parent.index, this.offset + this.length);
    return new Range(start, end);
  }

  /**
   * 裁剪当前 op
   * @param index
   * @param forward [?=false]
   */
  public sliceOp(index: number, forward = false): InsertOp {
    const text = this.getText();
    const op: InsertOp = {
      insert: forward ? text.slice(index, text.length) : text.slice(0, index),
    };
    if (this.op.attributes) {
      op.attributes = this.op.attributes;
    }
    return op;
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
