import type { AttributeMap, Op } from "block-kit-delta";
import { getOpLength } from "block-kit-delta";

import { EOL } from "../types";
import type { LineState } from "./line-state";

export class LeafState {
  /** EOL 节点 */
  public eol: boolean;
  /** Op 长度 */
  public length: number;
  /** Op 属性 */
  public attributes: AttributeMap;

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
    this.length = getOpLength(op);
    this.attributes = op.attributes || {};
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
}
