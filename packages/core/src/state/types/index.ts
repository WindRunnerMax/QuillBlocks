import type { O } from "block-kit-utils/dist/es/types";

import type { RawRange } from "../../selection/modules/raw-range";

export const EDITOR_STATE = {
  /** IME 组合状态 */
  COMPOSING: "COMPOSING",
  /** 挂载状态 */
  MOUNTED: "MOUNTED",
  /** 只读状态 */
  READONLY: "READONLY",
  /** 鼠标按键状态 */
  MOUSE_DOWN: "MOUSE_DOWN",
  /** 焦点状态 */
  FOCUS: "FOCUS",
  /** 渲染状态 */
  PAINTING: "PAINTING",
} as const;

export const APPLY_SOURCE = {
  USER: "USER",
  REMOTE: "REMOTE",
  HISTORY: "HISTORY",
};

export type ApplyOptions = {
  source?: O.Values<typeof APPLY_SOURCE>;
  range?: RawRange;
  autoCaret?: boolean;
};

export type ApplyResult = {
  id: string;
};
