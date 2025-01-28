import type { Op } from "block-kit-delta";
import type { AttributeMap } from "block-kit-delta";
import { NIL } from "block-kit-utils";

export const toggleMark = (key: string, value: string, preset: Record<string, string>) => {
  return { ...preset, [key]: preset[key] === value ? NIL : value };
};

export const filterMarkMap = (ops: Op[]): Record<string, string> => {
  const firstOp = ops[0];
  if (!firstOp || !firstOp.attributes) return {};
  // FIX: 取首个对象会被 immutable 的设计影响
  // 因此这里必须要将其 clone, 否则会影响渲染的内容
  const target: Record<string, string> = { ...firstOp.attributes };
  // 全部存在且相同的属性才认为是此时存在的 mark
  for (let i = 1; i < ops.length; i++) {
    const op = ops[i];
    const attrs = op.attributes;
    const keys = attrs && Object.keys(attrs);
    if (!keys || !keys.length) return {};
    for (const key of keys) {
      if (attrs[key] !== target[key]) {
        delete target[key];
      }
    }
  }
  return target;
};

export const filterLineMarkMap = (attrs: AttributeMap[]): Record<string, string> => {
  if (!attrs.length) return {};
  // FIX: 取首个对象会被 immutable 的设计影响
  // 因此这里必须要将其 clone, 否则会影响渲染的内容
  const target: Record<string, string> = { ...attrs[0] };
  for (let i = 1; i < attrs.length; i++) {
    const keys = Object.keys(attrs[i]);
    if (!keys || !keys.length) return {};
    for (const key of keys) {
      if (attrs[i][key] !== target[key]) {
        delete target[key];
      }
    }
  }
  return target;
};
