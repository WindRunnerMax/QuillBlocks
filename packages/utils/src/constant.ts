import { IS_MAC } from "./env";

/** 默认节点 */
export const ROOT_BLOCK = "ROOT";

/** 默认优先级 */
export const DEFAULT_PRIORITY = 100;

/** 键盘键值 */
export const KEY_CODE = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  Z: 90,
  Y: 89,
  A: 65,
  B: 66,
  I: 73,
  K: 75,
  U: 85,
};

/** Truly */
export const TRULY = "true";

/** Falsy */
export const FALSY = "false";

/** 控制键 */
export const CTRL_KEY: "metaKey" | "ctrlKey" = IS_MAC ? "metaKey" : "ctrlKey";

/** 空函数 */
export const NOOP = () => null;

/** NIL STRING */
export const NIL = "";
