import type { Op } from "block-kit-delta";
import { isEOLOp } from "block-kit-delta";

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
   * - void: 独立且不可编辑的节点
   * @param op
   */
  public isVoid(op: Op | null): boolean {
    if (!op || !op.insert || !op.attributes || isEOLOp(op)) {
      return false;
    }
    const attrs = op.attributes;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.void.has(key) && !this.inline.has(key) && attrs[key]);
  }

  /**
   * 判断 Inline 节点
   * - inline + mark: 不追踪末尾 Mark
   * @param op
   */
  public isInline(op: Op | null): boolean {
    if (!op || !op.insert || !op.attributes || isEOLOp(op)) {
      return false;
    }
    const attrs = op.attributes;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.inline.has(key) && !this.void.has(key) && attrs[key]);
  }

  /**
   * 判断 Block 节点
   * - block: 独占一行的可编辑节点
   * @param op
   */
  public isBlock(op: Op | null): boolean {
    if (!op || !op.insert || !op.attributes || isEOLOp(op)) {
      return false;
    }
    const attrs = op.attributes;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.block.has(key) && attrs[key]);
  }

  /**
   * 判断 Embed 节点
   * - void + inline: 行内 Void 节点 => Embed
   * @param op
   */
  public isEmbed(op: Op | null): boolean {
    if (!op || !op.insert || !op.attributes || isEOLOp(op)) {
      return false;
    }
    const attrs = op.attributes;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.void.has(key) && this.inline.has(key) && attrs[key]);
  }

  /**
   * 存在 Void Key 值
   * - void: 独立且不可编辑的节点
   * - void + inline: 行内 Void 节点 => Embed
   * @param op
   */
  public hasVoidKey(op: Op | null): boolean {
    if (!op || !op.insert || !op.attributes || isEOLOp(op)) {
      return false;
    }
    const attrs = op.attributes;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.void.has(key) && attrs[key]);
  }

  /**
   * 存在 Inline Key 值
   * - inline + mark: 不追踪末尾 Mark
   * - void + inline: 行内 Void 节点 => Embed
   * @param op
   */
  public hasInlineKey(op: Op | null): boolean {
    if (!op || !op.insert || !op.attributes || isEOLOp(op)) {
      return false;
    }
    const attrs = op.attributes;
    const keys = Object.keys(op.attributes);
    return keys.some(key => this.inline.has(key) && attrs[key]);
  }
}
