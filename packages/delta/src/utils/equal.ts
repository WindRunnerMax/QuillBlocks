import type { AttributeMap } from "../attributes/interface";
import type { Op } from "../delta/interface";

export const isEqualAttributes = (o: AttributeMap | undefined, t: AttributeMap | undefined) => {
  const origin = o || {};
  const target = t || {};
  const originKeys = Object.keys(origin);
  const targetKeys = Object.keys(target);
  if (originKeys.length !== targetKeys.length) return false;
  for (const key of originKeys) {
    if (origin[key] !== target[key]) return false;
  }
  return true;
};

export const isEqualOp = (origin: Op | undefined, target: Op | undefined) => {
  if (origin === target) return true;
  if (!origin || !target) return false;
  if (origin.insert !== target.insert) return false;
  if (origin.delete !== target.delete) return false;
  if (origin.retain !== target.retain) return false;
  if (!isEqualAttributes(origin.attributes, target.attributes)) return false;
  return true;
};
