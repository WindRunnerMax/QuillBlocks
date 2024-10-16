import type { AttributeMap, InsertOp } from "block-kit-delta";

import { EOL } from "../types";
import { Key } from "../utils/key";
import type { LineState } from "./line-state";

export class LeafState {
  /** EOL 节点 */
  public eol: boolean;
  /** Op 宽度 */
  public size: number;
  /** 唯一 key */
  public readonly key: string;
  /** Op 属性 */
  public attributes: AttributeMap;

  constructor(
    /** Op 起始索引 */
    public index: number,
    /** Op 起始偏移量 */
    public offset: number,
    /** Op 引用 */
    public op: InsertOp,
    /** 父级 LineState */
    public parent: LineState
  ) {
    this.eol = false;
    this.key = Key.getId(this);
    this.size = op.insert.length;
    this.attributes = op.attributes || {};
    if (op.insert === EOL) {
      this.eol = true;
    }
  }

  /**
   * 获取文本内容
   */
  public getText() {
    return this.op.insert;
  }

  /**
   * 获取 Op
   */
  public getOp() {
    return this.op;
  }
}
