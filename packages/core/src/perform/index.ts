import { Delta, EOL } from "block-kit-delta";

import type { Editor } from "../editor";
import { pickLeafAtPoint } from "../input/utils/collection";
import type { Range } from "../selection/modules/range";
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
  public insertText = (sel: Range, text: string) => {
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) {
      return void 0;
    }
    const point = sel.start;
    const leaf = pickLeafAtPoint(this.editor, point);
    if (leaf && leaf.block && leaf.block) {
      return void 0;
    }
    const isLeafTail = leaf ? point.offset - leaf.offset - leaf.length >= 0 : false;
    const attributes = this.editor.schema.filterTailMark(leaf && leaf.op, isLeafTail);
    const delta = new Delta().retain(raw.start).delete(raw.len).insert(text, attributes);
    this.editor.state.apply(delta, { range: raw });
  };

  /**
   * 删除选区片段
   * @param sel
   */
  public deleteFragment = (sel: Range) => {
    if (sel.isCollapsed) {
      return void 0;
    }
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) {
      return void 0;
    }
    const len = Math.max(raw.len, 0);
    const start = Math.max(raw.start, 0);
    if (start < 0 || len <= 0) {
      return void 0;
    }
    const delta = new Delta().retain(start).delete(len);
    this.editor.state.apply(delta, { range: raw });
  };

  /**
   * 向前删除字符
   * @param sel
   */
  public deleteBackward = (sel: Range) => {
    if (!sel.isCollapsed) {
      this.deleteFragment(sel);
      return void 0;
    }
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) {
      return void 0;
    }
    const start = raw.start - 1;
    if (start < 0) {
      return void 0;
    }
    const delta = new Delta().retain(start).delete(1);
    this.editor.state.apply(delta, { range: raw });
  };

  /**
   * 向后删除字符
   * @param sel
   */
  public deleteForward = (sel: Range) => {
    if (!sel.isCollapsed) {
      this.deleteFragment(sel);
      return void 0;
    }
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) {
      return void 0;
    }
    const start = raw.start;
    if (start < 0) {
      return void 0;
    }
    const delta = new Delta().retain(start).delete(1);
    this.editor.state.apply(delta, { range: raw });
  };

  /**
   * 插入换行符
   * @param sel
   */
  public insertBreak = (sel: Range) => {
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) {
      return void 0;
    }
    const start = raw.start;
    const len = raw.len;
    if (start < 0) {
      return void 0;
    }
    const delta = new Delta().retain(start);
    len && delta.delete(len);
    delta.insert(EOL);
    this.editor.state.apply(delta, { range: raw });
  };

  /**
   * 在选区处应用 Delta
   * @param sel
   * @param delta
   */
  public insertFragment = (sel: Range, delta: Delta) => {
    const raw = RawRange.fromRange(this.editor, sel);
    if (!raw) {
      return void 0;
    }
    const newDelta = new Delta().retain(raw.start).delete(raw.len).concat(delta);
    this.editor.state.apply(newDelta, { range: raw });
  };
}
