import type { Range } from "block-kit-core";

import type { LeafState } from "../modules/leaf-state";

/**
 * 判断 Leaf 是否与 Range 有交集
 * @param leaf
 * @param range
 */
export const isLeafRangeIntersect = (leaf: LeafState, range: Range) => {
  const start = range.start;
  const end = range.end;
  const leafLine = leaf.parent.getIndex();
  if (range.isCollapsed && start.line === leafLine && start.offset === leaf.offset) {
    return true;
  }
  // ------ RANGE START
  // ------ LEAF LINE
  // ------ RANGE END
  if (start.line < leafLine && leafLine < end.line) {
    return true;
  }
  const leafStart = leaf.offset;
  const leafEnd = leafStart + leaf.length;
  // --[LEAF_START]--[START_OFFSET]--[LEAF-END]--
  if (start.line === leafLine && start.offset <= leafEnd) {
    return true;
  }
  // --[LEAF_START]--[END_OFFSET]--[LEAF_END]--
  if (end.line === leafLine && leafStart <= end.offset) {
    return true;
  }
  return false;
};
