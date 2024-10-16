import type { Op } from "block-kit-delta";

import { EOL } from "../types";
import type { LineState } from "./line-state";

export class LeafState {
  /** EOL 节点 */
  public eol: boolean;
  /** Op 长度 */
  public length: number;

  constructor(
    /** Op 起始索引 */
    public index: number,
    /** Op 起始偏移量 */
    public offset: number,
    /** Op 引用 */
    public op: Op,
    /** 父级 LineState */
    public parent: LineState
  ) {
    this.eol = false;
    this.length = op.insert ? op.insert.length : 0;
    if (op.insert === EOL) {
      this.eol = true;
    }
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
  public static create(op: Op, index: number, offset: number, parent: LineState) {
    return new LeafState(index, offset, op, parent);
  }
}
