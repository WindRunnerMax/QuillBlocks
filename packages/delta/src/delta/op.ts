import type { DeleteOp, InsertOp, Op, RetainOp } from "./interface";
import { OpIterator } from "./iterator";

export const isRetainOp = (op: Op): op is RetainOp => {
  return typeof op.retain === "number";
};
export const isInsertOp = (op: Op): op is InsertOp => {
  return typeof op.insert === "string";
};
export const isDeleteOp = (op: Op): op is DeleteOp => {
  return typeof op.delete === "number";
};

export const getOpLength = (op: Op): number => {
  if (isDeleteOp(op)) {
    return op.delete;
  } else if (isRetainOp(op)) {
    return op.retain;
  } else if (isInsertOp(op)) {
    return op.insert.length;
  }
  throw new Error("unknown op");
};

export const iterator = (ops: Op[]): OpIterator => {
  return new OpIterator(ops);
};
