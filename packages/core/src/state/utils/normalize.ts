import type { Ops } from "block-kit-delta";
import type { Op } from "block-kit-delta";
import { isInsertOp } from "block-kit-delta";

import type { LineState } from "../modules/line-state";
import { EOL } from "../types";

/**
 * 标准化独立 EOL 字符
 * 方便处理 Ops 的换行操作
 * @param ops
 */
export const normalizeEOL = (ops: Ops) => {
  const collection: Ops = [];
  const collect = (op: Op) => {
    if (!op.attributes) {
      delete op.attributes;
    }
    return collection.push(op);
  };
  for (const op of ops) {
    if (!isInsertOp(op)) {
      collection.push(op);
      continue;
    }
    const attributes = op.attributes;
    if (op.insert === EOL) {
      collect({ insert: EOL, attributes });
      continue;
    }
    const part = op.insert.split(EOL);
    part.forEach((text, index) => {
      text && collect({ insert: text, attributes });
      if (index < part.length - 1) {
        collect({ insert: EOL, attributes });
      }
    });
  }
  return collection;
};

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
    const lineEnd = lineStart + lines[mid].size;
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
 * 规范化 End Of Line
 * @param text
 */
export const formatEOL = (text: string) => {
  return text.replace(/\r\n/g, EOL).replace(/\r/g, EOL);
};

/**
 * 判断是否为 EOL Op
 */
export const isEOL = (op: Op) => {
  return isInsertOp(op) && op.insert === EOL;
};
