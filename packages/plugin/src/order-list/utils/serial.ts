import type { Range } from "block-kit-core";
import type { Editor } from "block-kit-core";
import { Delta } from "block-kit-delta";
import type { O } from "block-kit-utils/dist/es/types";

import { INDENT_LEVEL_KEY } from "../../indent/types";
import { LIST_RESTART_KEY, LIST_START_KEY } from "../types";
import { isOrderList } from "./is";

/**
 * 批量刷新选区的列表序号 [批量刷新简单方便]
 * - 从选区开始的第一个列表项开始，逐个刷新序号
 * - 全量刷新序号数据, 最后需要在渲染时批量刷新
 * @param editor
 * @param sel
 */
export const applyNewOrderList = (editor: Editor, range?: Range) => {
  const sel = range || editor.selection.get();
  if (!sel) return void 0;
  const startPoint = sel.start;
  const block = editor.state.block;
  let start = startPoint.line;
  const selStartLine = block.getLine(sel.start.line);
  const selEndLine = block.getLine(sel.end.line);
  const selEndNextLine = selEndLine && selEndLine.next();
  // 如果当前行不是列表项，且选区结尾下一行是列表项，则从下一行开始探查
  if (
    selStartLine &&
    !isOrderList(selStartLine.attributes) &&
    selEndNextLine &&
    isOrderList(selEndNextLine.attributes)
  ) {
    start++;
  }
  // 如果 start 的行属性不存在列表项, 则无需刷新
  const currentLine = block.getLine(start);
  if (!currentLine || !isOrderList(currentLine.attributes)) {
    return void 0;
  }
  // 向前查找到第一个列表项
  while (--start >= 0) {
    const line = block.getLine(start);
    if (!line || !isOrderList(line.attributes)) {
      start++;
      break;
    }
  }
  const delta = new Delta();
  const startLine = block.getLine(start);
  if (!startLine) return void 0;
  delta.retain(startLine.start);
  // 逐行刷新序号
  const levelToIndex: O.Map<number> = {};
  for (let i = start; i < block.size; i++) {
    const line = block.getLine(i);
    const attrs = line && line.attributes;
    if (!line || !attrs || !isOrderList(attrs)) break;
    const level = attrs[INDENT_LEVEL_KEY];
    // 重置序号
    if (attrs[LIST_RESTART_KEY]) {
      levelToIndex[level] = 1;
    }
    const index = levelToIndex[level] || 1;
    levelToIndex[level] = index + 1;
    delta.retain(line.length - 1);
    delta.retain(1, { [LIST_START_KEY]: String(index) });
  }
  editor.state.apply(delta, { autoCaret: false });
};
