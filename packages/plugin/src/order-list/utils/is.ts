import type { AttributeMap } from "block-kit-delta";

import { LIST_TYPE_KEY } from "../../bullet-list/types";
import { ORDER_LIST_TYPE } from "../types";

/**
 * 检查有序列表
 * @param attrs
 */
export const isOrderList = (attrs: AttributeMap) => {
  return attrs[LIST_TYPE_KEY] === ORDER_LIST_TYPE;
};
