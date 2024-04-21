import type { BlockState } from "./block";

export const BLOCK_TO_DOM = new WeakMap<BlockState, HTMLElement>();
export const DOM_TO_BLOCK = new WeakMap<HTMLElement, BlockState>();
