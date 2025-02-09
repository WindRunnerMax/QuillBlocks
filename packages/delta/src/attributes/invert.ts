import type { AttributeMap } from "./interface";

/**
 * 反转属性
 * @param attr
 * @param base
 */
export const invertAttributes = (
  attr: AttributeMap = {},
  base: AttributeMap = {}
): AttributeMap => {
  const baseInverted = Object.keys(base).reduce<AttributeMap>((memo, key) => {
    if (base[key] !== attr[key] && attr[key] !== undefined) {
      memo[key] = base[key];
    }
    return memo;
  }, {});
  return Object.keys(attr).reduce<AttributeMap>((memo, key) => {
    if (attr[key] !== base[key] && base[key] === undefined) {
      memo[key] = "";
    }
    return memo;
  }, baseInverted);
};
