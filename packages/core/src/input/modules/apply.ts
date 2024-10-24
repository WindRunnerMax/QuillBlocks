import { Delta, EOL } from "block-kit-delta";

import type { Editor } from "../../editor";
import type { Range } from "../../selection/modules/range";
import { RawRange } from "../../selection/modules/raw-range";
import { pickOpAtRange } from "../utils/collection";

/**
 * 插入文本
 * @param editor
 * @param sel
 * @param text
 */
export const insertText = (editor: Editor, sel: Range, text: string) => {
  const raw = RawRange.fromRange(editor, sel);
  if (!raw) {
    return void 0;
  }
  const indexOp = pickOpAtRange(editor, sel);
  if (editor.schema.isVoid(indexOp)) {
    return void 0;
  }
  const attributes = editor.schema.filterTailMark(indexOp);
  const delta = new Delta().retain(raw.start).delete(raw.len).insert(text, attributes);
  editor.state.apply(delta, { range: raw });
};

/**
 * 删除选区片段
 * @param editor
 * @param sel
 */
export const deleteFragment = (editor: Editor, sel: Range) => {
  if (sel.isCollapsed) {
    return void 0;
  }
  const raw = RawRange.fromRange(editor, sel);
  if (!raw) {
    return void 0;
  }
  const len = Math.max(raw.len, 0);
  const start = Math.max(raw.start, 0);
  if (start < 0 || len <= 0) {
    return void 0;
  }
  const delta = new Delta().retain(start).delete(len);
  editor.state.apply(delta, { range: raw });
};

/**
 * 向前删除字符
 * @param editor
 * @param sel
 */
export const deleteBackward = (editor: Editor, sel: Range) => {
  if (!sel.isCollapsed) {
    deleteFragment(editor, sel);
    return void 0;
  }
  const raw = RawRange.fromRange(editor, sel);
  if (!raw) {
    return void 0;
  }
  const start = raw.start - 1;
  if (start < 0) {
    return void 0;
  }
  const delta = new Delta().retain(start).delete(1);
  editor.state.apply(delta, { range: raw });
};

/**
 * 向后删除字符
 * @param editor
 * @param sel
 */
export const deleteForward = (editor: Editor, sel: Range) => {
  if (!sel.isCollapsed) {
    deleteFragment(editor, sel);
    return void 0;
  }
  const raw = RawRange.fromRange(editor, sel);
  if (!raw) {
    return void 0;
  }
  const start = raw.start;
  if (start < 0) {
    return void 0;
  }
  const delta = new Delta().retain(start).delete(1);
  editor.state.apply(delta, { range: raw });
};

/**
 * 插入换行符
 * @param editor
 * @param sel
 */
export const insertBreak = (editor: Editor, sel: Range) => {
  const raw = RawRange.fromRange(editor, sel);
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
  editor.state.apply(delta, { range: raw });
};
