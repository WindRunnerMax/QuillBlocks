import type { LeafContext, LeafState, LineContext, LineState } from "block-kit-core";

/**
 * 包装行状态
 */
export type ReactWrapLineContext = {
  lineState: LineState;
  children?: React.ReactNode;
};

/**
 * 包装叶子状态
 */
export type ReactWrapLeafContext = {
  leafState: LeafState;
  children?: React.ReactNode;
};

/**
 * 行状态
 */
export interface ReactLineContext extends LineContext {
  children?: React.ReactNode;
}

/**
 * 叶子状态
 */
export interface ReactLeafContext extends LeafContext {
  children?: React.ReactNode;
}

/**
 * 包装类型
 */
export const WRAP_TYPE = {
  LINE: "wrapLine",
  LEAF: "wrapLeaf",
} as const;
