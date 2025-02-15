import type { LeafState, LineState } from "block-kit-core";

/**
 * LeafState 与 Text 节点的映射
 * - 仅处理文本节点, 零宽字符节点暂不处理
 */
export const LEAF_TO_TEXT = new WeakMap<LeafState, HTMLElement | null>();

/**
 * JSX.Element 与 State 的映射
 * - 渲染时即刻加入映射, wrap 时即刻消费映射
 */
export const JSX_TO_STATE = new WeakMap<JSX.Element, LeafState | LineState>();

/**
 * State 与 Wrapper Symbol 的映射
 * - 主要是取得已经处理过的节点, 避免重复处理
 */
export const STATE_TO_SYMBOL = new WeakMap<LeafState | LineState, string>();
