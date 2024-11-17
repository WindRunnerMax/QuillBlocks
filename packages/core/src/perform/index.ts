import type { AttributeMap } from "block-kit-delta";
import { Delta, EOL } from "block-kit-delta";
import { NOOP } from "block-kit-utils";
import type { P } from "block-kit-utils/dist/es/types";

import type { Editor } from "../editor";
import { Point } from "../selection/modules/point";
import type { Range } from "../selection/modules/range";
import { RawPoint } from "../selection/modules/raw-point";
import { RawRange } from "../selection/modules/raw-range";

export class Perform {
  /**
   * 构造函数
   * @param editor
   */
  constructor(private editor: Editor) {}

  /**
   * 插入文本
   * @param sel
   * @param text
   */
  public insertText(sel: Range, text: string) {
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    const point = sel.start;
    const leaf = this.editor.collect.pickLeafAtPoint(point);
    if (leaf && leaf.block && leaf.block) return void 0;
    const isLeafTail = leaf ? point.offset - leaf.offset - leaf.length >= 0 : false;
    const attributes = this.editor.schema.filterTailMark(leaf && leaf.op, isLeafTail);
    const delta = new Delta().retain(raw.start).delete(raw.len).insert(text, attributes);
    this.editor.state.apply(delta, { range: raw });
  }

  /**
   * 删除选区片段
   * @param sel
   */
  public deleteFragment(sel: Range) {
    if (sel.isCollapsed) return void 0;
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    const len = Math.max(raw.len, 0);
    const start = Math.max(raw.start, 0);
    if (start < 0 || len <= 0) return void 0;
    const delta = new Delta().retain(start).delete(len);
    this.editor.state.apply(delta, { range: raw });
  }

  /**
   * 向前删除字符
   * @param sel
   */
  public deleteBackward(sel: Range) {
    if (!sel.isCollapsed) return this.deleteFragment(sel);
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    const start = raw.start - 1;
    if (start < 0) return void 0;
    const delta = new Delta().retain(start).delete(1);
    this.editor.state.apply(delta, { range: raw });
  }

  /**
   * 向后删除字符
   * @param sel
   */
  public deleteForward(sel: Range) {
    if (!sel.isCollapsed) return this.deleteFragment(sel);
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    const start = raw.start;
    if (start < 0) return void 0;
    const delta = new Delta().retain(start).delete(1);
    this.editor.state.apply(delta, { range: raw });
  }

  /**
   * 插入换行符
   * @param sel
   * @param attributes
   */
  public insertBreak(sel: Range, attributes?: AttributeMap) {
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    let attrs: AttributeMap | P.Undef = void 0;
    const block = this.editor.state.block;
    const state = block.getLine(sel.start.line);
    // COMPAT: 折叠选区状态且非行首情况下, 复制行属性到当前插入的行
    // x|x(\n {y:1}) => x(\n {y:1})x(\n {y:1})
    if (sel.isCollapsed && state && sel.start.offset) {
      attrs = state.attributes;
      const lineOffset = state.length - 1;
      // 如果此时光标在行末, 则需要将 NextLine 的属性移除
      if (sel.start.offset === lineOffset && attrs) {
        const nextAttrs = attributes || {};
        Object.keys(attrs).forEach(key => (nextAttrs[key] = NOOP));
        attributes = nextAttrs;
      }
    }
    const start = raw.start;
    const len = raw.len;
    if (start < 0) return void 0;
    const delta = new Delta().retain(start);
    len && delta.delete(len);
    delta.insert(EOL, attrs);
    // COMPAT: 如果存在预设的属性 则需要合并到拆分的行属性中
    // x|x(\n {y:1}) => x(\n {y:1})x(\n {y:1 & attributes})
    if (sel.isCollapsed && attributes && state) {
      const nextAttrs = attributes;
      const lineOffset = state.length - 1;
      delta.retain(lineOffset - sel.start.offset).retain(1, nextAttrs);
    }
    this.editor.state.apply(delta, { range: raw });
  }

  /**
   * 在选区处应用 Delta
   * @param sel
   * @param delta
   */
  public insertFragment(sel: Range, delta: Delta) {
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    const newDelta = new Delta().retain(raw.start).delete(raw.len).concat(delta);
    this.editor.state.apply(newDelta, { range: raw });
  }

  /**
   * 在选区处应用 Mark
   * @param sel
   * @param attributes
   */
  public applyMarks(sel: Range, attributes: AttributeMap) {
    if (sel.isCollapsed) return void 0;
    const { start, end } = sel;
    const block = this.editor.state.block;
    const startLine = block.getLine(start.line);
    const rawPoint = RawPoint.fromPoint(this.editor, start);
    if (!startLine || !rawPoint) return void 0;
    const delta = new Delta();
    delta.retain(rawPoint.offset);
    const endOffset = startLine.length - 1;
    // 如果是同行则直接 slice
    if (start.line === end.line) {
      const minOffset = Math.min(end.offset, endOffset);
      delta.retain(minOffset - start.offset, attributes);
      return this.editor.state.apply(delta.chop());
    }
    // 处理首行
    delta.retain(endOffset - start.offset, attributes);
    delta.retain(1);
    // 处理中间行
    for (let i = start.line + 1; i < end.line; i++) {
      const lineState = block.getLine(i);
      if (!lineState) break;
      delta.retain(lineState.length - 1, attributes);
      delta.retain(1);
    }
    // 处理尾行
    const endLine = block.getLine(end.line);
    if (endLine) {
      const minOffset = Math.min(end.offset, endLine.length - 1);
      delta.retain(minOffset, attributes);
    }
    this.editor.state.apply(delta.chop());
  }

  /**
   * 在选区处应用行 Mark
   * @param sel
   * @param attributes
   */
  public applyLineMarks(sel: Range, attributes: AttributeMap) {
    const { start, end } = sel;
    const block = this.editor.state.block;
    const rawPoint = RawPoint.fromPoint(this.editor, Point.from(start.line, 0));
    if (!rawPoint) return void 0;
    const delta = new Delta();
    delta.retain(rawPoint.offset);
    for (let i = start.line; i <= end.line; i++) {
      const lineState = block.getLine(i);
      if (!lineState) break;
      delta.retain(lineState.length - 1);
      delta.retain(1, attributes);
    }
    this.editor.state.apply(delta);
  }
}
