import type { AttributeMap } from "block-kit-delta";

import { BULLET_LIST_TYPE, LIST_TYPE_KEY } from "../types";

/**
 * 检查无序列表
 * @param attrs
 */
export const isBulletList = (attrs: AttributeMap) => {
  return attrs[LIST_TYPE_KEY] === BULLET_LIST_TYPE;
};
