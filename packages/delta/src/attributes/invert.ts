import type { AttributeMap } from "./interface";

export const invertAttributes = (
  attr: AttributeMap = {},
  base: AttributeMap = {}
): AttributeMap => {
  attr = attr || {};
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
