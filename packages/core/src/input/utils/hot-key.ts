import { IS_MAC, KEY_CODE } from "block-kit-utils";

export const CTRL_KEY = IS_MAC ? "metaKey" : "ctrlKey";

export const isArrowLeft = (event: KeyboardEvent) => event.keyCode === KEY_CODE.LEFT;
export const isArrowRight = (event: KeyboardEvent) => event.keyCode === KEY_CODE.RIGHT;
export const isArrowUp = (event: KeyboardEvent) => event.keyCode === KEY_CODE.UP;
export const isArrowDown = (event: KeyboardEvent) => event.keyCode === KEY_CODE.DOWN;
