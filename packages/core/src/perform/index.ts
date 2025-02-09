import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import { invertAttributes } from "block-kit-delta";

import { getFirstUnicodeLen, getLastUnicodeLen } from "../collect/utils/string";
import type { Editor } from "../editor";
import { isBlockLine } from "../schema/utils/is";
import { Point } from "../selection/modules/point";
import { Range } from "../selection/modules/range";
import { RawPoint } from "../selection/modules/raw-point";
import { RawRange } from "../selection/modules/raw-range";

export class Perform {
  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: Editor) {}

  /**
   * 插入文本
   * @param sel
   * @param text
   */
  public insertText(sel: Range, text: string) {
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    const point = sel.start;
    const leaf = this.editor.collect.getLeafAtPoint(point);
    // FIX: 当前节点为 void 时, 不能插入文本
    if (leaf && leaf.void) return void 0;
    let attributes: AttributeMap | undefined = this.editor.collect.marks;
    if (!sel.isCollapsed) {
      // 非折叠选区时, 需要以 start 起始判断该节点的尾部 marks
      const isLeafTail = leaf && point.offset - leaf.offset - leaf.length >= 0;
      attributes = this.editor.collect.getLeafMarks(leaf && leaf.op, isLeafTail);
    }
    const delta = new Delta().retain(raw.start).delete(raw.len).insert(text, attributes);
    this.editor.state.apply(delta, { range: raw });
    return void 0;
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
    return void 0;
  }

  /**
   * 向前删除字符
   * @param sel
   */
  public deleteBackward(sel: Range) {
    if (!sel.isCollapsed) return this.deleteFragment(sel);
    const line = this.editor.state.block.getLine(sel.start.line);
    // 处于当前行的行首, 且存在行状态节点
    if (sel.start.offset === 0 && line) {
      const prevLine = line && line.prev();
      // 上一行为块节点且处于当前行首时, 删除则移动光标到该节点上
      if (prevLine && isBlockLine(prevLine)) {
        const firstLeaf = prevLine.getFirstLeaf();
        const range = firstLeaf && firstLeaf.toRange();
        range && this.editor.selection.set(range, true);
        return void 0;
      }
      const attrsLength = Object.keys(line.attributes).length;
      // 如果在当前行的行首, 且存在其他行属性, 则删除当前行的行属性
      if (attrsLength > 0) {
        const delta = new Delta()
          .retain(line.start + line.length - 1)
          .retain(1, invertAttributes(line.attributes));
        this.editor.state.apply(delta, { autoCaret: false });
        return void 0;
      }
      // 如果在当前行的行首, 且不存在其他行属性, 则将当前行属性移到下一行
      if (prevLine && !attrsLength) {
        const prevAttrs = { ...prevLine.attributes };
        const delta = new Delta()
          .retain(line.start - 1)
          .delete(1)
          .retain(line.length - 1)
          .retain(1, prevAttrs);
        this.editor.state.apply(delta);
        return void 0;
      }
    }
    // 处理基本的删除操作
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    const op = this.editor.collect.getBackwardOpAtPoint(sel.start);
    let len = 1;
    if (op && op.insert) {
      // 处理 Unicode 字符
      len = getLastUnicodeLen(op.insert);
    }
    const start = raw.start - len;
    if (start < 0) return void 0;
    const delta = new Delta().retain(start).delete(len);
    this.editor.state.apply(delta, { range: raw });
    return void 0;
  }

  /**
   * 向后删除字符
   * @param sel
   */
  public deleteForward(sel: Range) {
    if (!sel.isCollapsed) return this.deleteFragment(sel);
    const line = this.editor.state.block.getLine(sel.start.line);
    // 当前行为块结构时, 执行 backward 删除操作
    if (line && sel.start.offset === 1 && isBlockLine(line)) {
      this.deleteBackward(sel);
      return void 0;
    }
    const nextLine = line && line.next();
    // 下一行为块节点且处于当前行末时, 删除则移动光标到该节点上
    if (line && sel.start.offset === line.length - 1 && nextLine && isBlockLine(nextLine)) {
      const firstLeaf = nextLine.getFirstLeaf();
      const range = firstLeaf && firstLeaf.toRange();
      range && this.editor.selection.set(range, true);
      return void 0;
    }
    // 处理基本的删除操作
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) return void 0;
    const start = raw.start;
    const op = this.editor.collect.getForwardOpAtPoint(sel.start);
    let len = 1;
    if (op && op.insert) {
      // 处理 Unicode 字符
      len = getFirstUnicodeLen(op.insert);
    }
    if (start < 0) return void 0;
    const delta = new Delta().retain(start).delete(len);
    this.editor.state.apply(delta, { range: raw });
    return void 0;
  }

  /**
   * 插入换行符
   * @param sel
   * @param attributes
   */
  public insertBreak(sel: Range, attributes?: AttributeMap) {
    const raw = RawRange.fromRange(this.editor, sel);
    const block = this.editor.state.block;
    const startLine = block.getLine(sel.start.line);
    const endLine = block.getLine(sel.end.line);
    if (!raw || !startLine || !endLine) return void 0;
    const start = raw.start;
    const len = raw.len;
    const delta = new Delta().retain(start);
    len && delta.delete(len);
    let point: Point | null = null;
    if (start === startLine.start) {
      // 当光标在行首时, 直接移动行属性
      // |xx(\n {y:1}) => (\n)|xx(\n {y:1} & attributes)
      delta.insertEOL();
      const lineOffset = endLine.length - 1;
      delta.retain(lineOffset - sel.end.offset).retain(1, attributes);
      point = new Point(sel.start.line + 1, 0);
    } else if (start === startLine.start + startLine.length - 1) {
      // 当光标在行尾时, 将行属性保留在当前行
      // xx|(\n {y:1}) => xx(\n {y:1})(\n attributes)
      delta.retain(1).insertEOL(attributes);
      point = new Point(sel.start.line + 1, 0);
    } else {
      // 当光标在行中时, 将行属性保留在当前行, 下一行合并新属性
      // x|x(\n {y:1}) => xx(\n {y:1})(\n {y:1} & attributes)
      delta.insertEOL(startLine.attributes);
      const lineOffset = endLine.length - 1;
      const attrs = { ...startLine.attributes, ...attributes };
      delta.retain(lineOffset - sel.end.offset).retain(1, attrs);
    }
    // FIX: 跨行 \n 的 delta 会越过当前的 sel, 因此需要手动校准
    this.editor.state.apply(delta, { range: raw, autoCaret: !point });
    point && this.editor.selection.set(new Range(point, point.clone()));
    return void 0;
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
    return void 0;
  }

  /**
   * 在选区处应用 Mark
   * @param sel
   * @param attributes
   */
  public applyMarks(sel: Range, attributes: AttributeMap) {
    if (sel.isCollapsed) {
      this.editor.collect.marks = {
        ...this.editor.collect.marks,
        ...attributes,
      };
      return void 0;
    }
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
    return void 0;
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
    return void 0;
  }
}
