import { isEmptyValue } from "blocks-kit-utils";

import type { AttributeMap } from "../attributes/interface";
import type { DeltaBlockLike, DeltaLike, DeltaSetLike } from "../cluster/interface";
import type { Op, Ops } from "../delta/interface";

export const cloneAttributes = (attrs: AttributeMap): AttributeMap => {
  const newAttrs = {} as AttributeMap;
  for (const [key, value] of Object.entries(attrs)) {
    newAttrs[key] = value;
  }
  return newAttrs;
};

export const cloneOp = (op: Op): Op => {
  const attributes = op.attributes;
  if (isEmptyValue(attributes)) {
    return { ...op };
  } else {
    return { ...op, attributes: cloneAttributes(attributes) };
  }
};

export const cloneOps = (ops: Ops): Ops => {
  return ops.map(cloneOp);
};

export const cloneDeltaLike = (delta: DeltaLike): DeltaLike => {
  return { ...delta, ops: cloneOps(delta.ops) };
};

export const cloneZoneDeltaLike = (delta: DeltaBlockLike): DeltaBlockLike => {
  return { ...delta, ops: cloneOps(delta.ops) };
};

export const cloneDeltaSetLike = (deltaSet: DeltaSetLike): DeltaSetLike => {
  const newDeltaSetLike = {} as DeltaSetLike;
  for (const [key, value] of Object.entries(deltaSet)) {
    newDeltaSetLike[key] = cloneZoneDeltaLike(value);
  }
  return newDeltaSetLike;
};
