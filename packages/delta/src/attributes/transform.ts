import { isObject } from "block-kit-utils";

import type { AttributeMap } from "./interface";

/**
 * 转换属性
 * @param a
 * @param b
 * @param priority
 */
export const transformAttributes = (
  a: AttributeMap | undefined,
  b: AttributeMap | undefined,
  priority = false
): AttributeMap | undefined => {
  if (!isObject(a)) return b;
  if (!isObject(b)) return undefined;
  // b simply overwrites us without priority
  if (!priority) return b;
  const attributes = Object.keys(b).reduce<AttributeMap>((attrs, key) => {
    if (a[key] === undefined) {
      // null is a valid value
      attrs[key] = b[key];
    }
    return attrs;
  }, {});
  return Object.keys(attributes).length > 0 ? attributes : undefined;
};
