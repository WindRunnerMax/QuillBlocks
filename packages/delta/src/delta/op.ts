import type { DeleteOp, InsertOp, Op, RetainOp } from "./interface";

export const isRetainOp = (op: Op): op is RetainOp => {
  return op && typeof op.retain === "number";
};
export const isInsertOp = (op: Op): op is InsertOp => {
  return op && typeof op.insert === "string";
};
export const isDeleteOp = (op: Op): op is DeleteOp => {
  return op && typeof op.delete === "number";
};

export const getOpLength = (op: Op): number => {
  if (isDeleteOp(op)) {
    return op.delete;
  } else if (isRetainOp(op)) {
    return op.retain;
  } else if (isInsertOp(op)) {
    return op.insert.length;
  }
  console.trace("Unknown Op:", op);
  return 0;
};
