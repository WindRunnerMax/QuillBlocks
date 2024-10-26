import type { AttributeMap, Op } from "block-kit-delta";
import { isEOLOp } from "block-kit-delta";

import type { EditorSchema } from "./types";

export class Schema {
  /** Void */
  public readonly void: Set<string> = new Set<string>();
  /** Block */
  public readonly block: Set<string> = new Set<string>();
  /** Inline */
  public readonly inline: Set<string> = new Set<string>();
  /** Tail Mark */
  public readonly tailMark: Set<string> = new Set<string>();

  constructor(schema: EditorSchema) {
    for (const [key, value] of Object.entries(schema)) {
      value.void && this.void.add(key);
      value.block && this.block.add(key);
      value.inline && this.inline.add(key);
      value.tailMark && this.tailMark.add(key);
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
   * 过滤出 Tail Mark
   * @param op
   */
  public filterTailMark(op: Op | null): AttributeMap | undefined {
    if (!op || !op.attributes || isEOLOp(op)) return void 0;
    const keys = Object.keys(op.attributes);
    const result: AttributeMap = {};
    for (const key of keys) {
      if (this.tailMark.has(key)) {
        result[key] = op.attributes[key];
      }
    }
    return Object.keys(result).length ? result : void 0;
  }
}
