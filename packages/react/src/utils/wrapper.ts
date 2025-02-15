import { JSX_TO_STATE, STATE_TO_SYMBOL } from "./weak-map";

/**
 * 根据属性获取唯一标识值
 * @param keys
 * @param element
 */
export const getWrapSymbol = (keys: string[], el: JSX.Element | undefined): string | null => {
  if (!el) return null;
  const state = JSX_TO_STATE.get(el);
  const cache = state && STATE_TO_SYMBOL.get(state);
  if (cache || !state) return cache || null;
  const attrs = state.op.attributes;
  if (!attrs || !Object.keys(attrs).length || !keys.length) {
    return null;
  }
  const suite: string[] = [];
  for (const key of keys) {
    attrs[key] && suite.push(`${key}${attrs[key]}`);
  }
  const symbol = suite.join("");
  STATE_TO_SYMBOL.set(state, symbol);
  return symbol;
};
