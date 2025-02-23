import { isObject } from "block-kit-utils";

import type { AttributeMap } from "./interface";

/**
 * 组合属性
 * @param a
 * @param b
 * @param keepEmpty 保留空属性
 */
export const composeAttributes = (
  a: AttributeMap = {},
  b: AttributeMap = {},
  keepEmpty = false
): AttributeMap | undefined => {
  if (!isObject(a)) a = {};
  if (!isObject(b)) b = {};
  let attributes = { ...b };
  if (!keepEmpty) {
    // Remove empty attributes
    attributes = Object.keys(attributes).reduce<AttributeMap>((copy, key) => {
      if (attributes[key] !== "" && attributes[key] !== null) {
        copy[key] = attributes[key];
      }
      return copy;
    }, {});
  }
  for (const key of Object.keys(a)) {
    // Compose a to b
    if (a[key] !== undefined && b[key] === undefined) {
      attributes[key] = a[key];
    }
  }
  return Object.keys(attributes).length > 0 ? attributes : undefined;
};
