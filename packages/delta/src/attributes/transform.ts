import { isObject } from "blocks-kit-utils";

import type { AttributeMap } from "./interface";

export const transformAttributes = (
  a: AttributeMap | undefined,
  b: AttributeMap | undefined,
  priority = false
): AttributeMap | undefined => {
  if (!isObject(a)) {
    return b;
  }
  if (!isObject(b)) {
    return undefined;
  }
  if (!priority) {
    return b; // b simply overwrites us without priority
  }
  const attributes = Object.keys(b).reduce<AttributeMap>((attrs, key) => {
    if (a[key] === undefined) {
      attrs[key] = b[key]; // null is a valid value
    }
    return attrs;
  }, {});
  return Object.keys(attributes).length > 0 ? attributes : undefined;
};
