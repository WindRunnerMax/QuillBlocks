import type { Delta } from "../delta/delta";
import type { Op, Ops } from "../delta/interface";
import { EOL } from "../delta/interface";
import { isInsertOp } from "../delta/op";

/**
 * 判断 Delta 是否以指定文本结尾
 * @param delta
 * @param text
 */
export const deltaEndsWith = (delta: Delta, text: string): boolean => {
  const ops = delta.ops;
  let index = text.length - 1;
  for (const op of ops) {
    if (isInsertOp(op)) {
      const opText = op.insert;
      for (let i = opText.length - 1; i >= 0; --i) {
        if (opText[i] !== text[index]) return false;
        --index;
        if (index < 0) return true;
      }
    }
  }
  return false;
};

/**
 * 标准化独立 EOL 字符
 * @param ops
 * @note 方便处理 Ops 的换行操作
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
      if (index === part.length - 1) return void 0;
      collect({ insert: EOL, attributes });
    });
  }
  return collection;
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
export const isEOLOp = (op: Op | null) => {
  return op && isInsertOp(op) && op.insert === EOL;
};
