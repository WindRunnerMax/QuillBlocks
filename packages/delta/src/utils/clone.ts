import { isEmptyValue } from "block-kit-utils";

import type { AttributeMap } from "../attributes/interface";
import type { BlockDeltaLike, BlockSetLike, DeltaLike } from "../cluster/interface";
import type { Op, Ops } from "../delta/interface";

/**
 * 克隆属性
 * @param attrs
 */
export const cloneAttributes = (attrs: AttributeMap): AttributeMap => {
  const newAttrs = {} as AttributeMap;
  for (const [key, value] of Object.entries(attrs)) {
    newAttrs[key] = value;
  }
  return newAttrs;
};

/**
 * 克隆操作
 * @param op
 */
export const cloneOp = (op: Op): Op => {
  const attributes = op.attributes;
  if (isEmptyValue(attributes)) {
    return { ...op };
  } else {
    return { ...op, attributes: cloneAttributes(attributes) };
  }
};

/**
 * 克隆操作集合
 * @param ops
 */
export const cloneOps = (ops: Ops): Ops => {
  return ops.map(cloneOp);
};

/**
 * 克隆 DeltaLike
 * @param delta
 */
export const cloneDeltaLike = (delta: DeltaLike): DeltaLike => {
  return { ...delta, ops: cloneOps(delta.ops) };
};

/**
 * 克隆 BlockDeltaLike
 * @param delta
 */
export const cloneBlockDeltaLike = (delta: BlockDeltaLike): BlockDeltaLike => {
  return { ...delta, ops: cloneOps(delta.ops) };
};

/**
 * 克隆 BlockSetLike
 * @param blockSet
 */
export const cloneBlockSetLike = (blockSet: BlockSetLike): BlockSetLike => {
  const newBlockSetLike = {} as BlockSetLike;
  for (const [key, value] of Object.entries(blockSet)) {
    newBlockSetLike[key] = cloneBlockDeltaLike(value);
  }
  return newBlockSetLike;
};
