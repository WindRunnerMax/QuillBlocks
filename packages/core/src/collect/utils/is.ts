import type { Point } from "../../selection/modules/point";
import type { LeafState } from "../../state/modules/leaf-state";

/**
 * 判断是否是 Leaf 的尾部
 * @param leaf
 * @param point
 */
export const isLeafOffsetTail = (leaf: LeafState | null, point: Point) => {
  return leaf && point.offset - leaf.offset - leaf.length >= 0;
};
