import type { LineState } from "../../state/modules/line-state";

/**
 * 判断 Block 行状态
 * - block + void: 独占一行的 Void 节点
 * @param op
 */
export const isBlockLine = (line: LineState | null): boolean => {
  if (!line) return false;
  const firstLeaf = line.getFirstLeaf();
  return !!firstLeaf && firstLeaf.void && !firstLeaf.inline;
};
