import type { AttributeMap, Op } from "block-kit-delta";
import { isEOLOp } from "block-kit-delta";

import type { LineState } from "../state/modules/line-state";
import type { EditorSchema } from "./types";

export class Schema {
  /** Void */
  public readonly void: Set<string> = new Set<string>();
  /** Mark */
  public readonly mark: Set<string> = new Set<string>();
  /** Block */
  public readonly block: Set<string> = new Set<string>();
  /** Inline */
  public readonly inline: Set<string> = new Set<string>();

  /**
   * 构造函数
   * @param schema
   */
  constructor(schema: EditorSchema) {
    for (const [key, value] of Object.entries(schema)) {
      value.void && this.void.add(key);
      value.mark && this.mark.add(key);
      value.block && this.block.add(key);
      value.inline && this.inline.add(key);
    }
  }

  /**
   * 判断 Void 节点
   * @param op
   */
  public isVoid(op: Op | null): boolean {
    if (!op || !op.attributes || isEOLOp(op)) return false;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.void.has(key));
  }

  /**
   * 判断 Inline 节点
   * @param op
   */
  public isInline(op: Op | null): boolean {
    if (!op || !op.attributes || isEOLOp(op)) return false;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.inline.has(key));
  }

  /**
   * 判断 Block 节点
   * @param op
   */
  public isBlock(op: Op | null): boolean {
    if (!op || !op.attributes || isEOLOp(op)) return false;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.block.has(key));
  }

  /**
   * 过滤需要追踪的属性
   * @param op 操作
   * @param isLeafTail 是否在节点尾部
   */
  public filterTailMark(op: Op | null, isLeafTail: boolean | null): AttributeMap | undefined {
    if (!op || !op.attributes || isEOLOp(op)) return void 0;
    const keys = Object.keys(op.attributes);
    const result: AttributeMap = {};
    for (const key of keys) {
      if (this.mark.has(key)) {
        result[key] = op.attributes[key];
      }
      if (isLeafTail && this.inline.has(key)) {
        delete result[key];
      }
    }
    return Object.keys(result).length ? result : void 0;
  }

  /**
   * 判断 Block 行状态
   * @param op
   */
  public isBlockLine(line: LineState | null): boolean {
    if (!line) return false;
    const firstLeaf = line.getFirstLeaf();
    return !!firstLeaf && this.isBlock(firstLeaf.op);
  }
}
