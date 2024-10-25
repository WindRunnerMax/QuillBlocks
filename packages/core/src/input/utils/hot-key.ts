import { IS_MAC, KEY_CODE } from "block-kit-utils";

export const CTRL = IS_MAC ? "metaKey" : "ctrlKey";

export const isArrowLeft = (e: KeyboardEvent) => e.keyCode === KEY_CODE.LEFT;
export const isArrowRight = (e: KeyboardEvent) => e.keyCode === KEY_CODE.RIGHT;
export const isArrowUp = (e: KeyboardEvent) => e.keyCode === KEY_CODE.UP;
export const isArrowDown = (e: KeyboardEvent) => e.keyCode === KEY_CODE.DOWN;
export const isUndo = (e: KeyboardEvent) => !e.shiftKey && e[CTRL] && e.keyCode === KEY_CODE.Z;
export const isRedo = (e: KeyboardEvent) => e.shiftKey && e[CTRL] && e.keyCode === KEY_CODE.Z;
