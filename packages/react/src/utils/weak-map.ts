import type { LeafState } from "block-kit-core";

/**
 * LeafState 与 Text 节点的映射
 * - 仅处理文本节点, 零宽字符节点暂不处理
 */
export const LEAF_TO_TEXT = new WeakMap<LeafState, HTMLElement | null>();
