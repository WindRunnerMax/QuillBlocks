import type { Op, Ops } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import { cloneOp, EOL, EOL_OP, isInsertOp, startsWithEOL } from "block-kit-delta";

import type { Editor } from "../../editor";
import type { LineState } from "../modules/line-state";

/**
 * 根据 offset 二分查找 LineState[] 中的 LineState
 * @param lines
 * @param offset
 */
export const binarySearch = (lines: LineState[], offset: number) => {
  let start = 0;
  let end = lines.length - 1;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const lineStart = lines[mid].start;
    const lineEnd = lineStart + lines[mid].length;
    if (offset >= lineStart && offset < lineEnd) {
      return lines[mid];
    } else if (offset < lineStart) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  return null;
};

/**
 * 标准化 Delta
 * - 处理 Ops 的换行操作
 * - 针对 Void 节点补充 EOL
 * @param editor
 * @param delta
 */
export const normalizeDelta = (editor: Editor, delta: Delta) => {
  const ops = delta.ops;
  const collection: Ops = [];
  const collect = (op: Op) => {
    if (!op.attributes) {
      delete op.attributes;
    }
    return collection.push(op);
  };
  ops.forEach((op, index) => {
    if (!isInsertOp(op)) {
      collection.push(op);
      return void 0;
    }
    const attributes = op.attributes;
    if (op.insert === EOL) {
      collect({ insert: EOL, attributes });
      return void 0;
    }
    // 如果当前 Op 存在 Void Key, 即 Void/Embed 节点
    if (editor.schema.hasVoidKey(op)) {
      const nextOp = ops[index + 1];
      // 当前处理的长度需要规整为 1
      collect({ ...op, insert: op.insert.slice(0, 1) });
      // 若下个节点不是 EOL, 则需要补充 EOL
      if (!startsWithEOL(nextOp)) collect(cloneOp(EOL_OP));
      return void 0;
    }
    const part = op.insert.split(EOL);
    part.forEach((text, i) => {
      text && collect({ insert: text, attributes });
      if (i === part.length - 1) return void 0;
      collect({ insert: EOL, attributes });
    });
    return void 0;
  });
  return new Delta(collection);
};
