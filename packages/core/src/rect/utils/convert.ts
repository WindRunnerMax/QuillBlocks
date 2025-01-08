import type { Rect } from "../types";

/**
 * 将 DOMRect 转换为 Rect
 * @param rect
 */
export const fromDOMRect = (rect: DOMRect): Rect => {
  return {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    height: rect.height,
    width: rect.width,
  };
};

/**
 * 取 Rect 相对位置
 * @param rect
 * @param base
 */
export const relativeTo = (rect: Rect, base: Rect): Rect => {
  return {
    top: rect.top - base.top,
    bottom: rect.bottom - base.top,
    left: rect.left - base.left,
    right: rect.right - base.left,
    height: rect.height,
    width: rect.width,
  };
};
