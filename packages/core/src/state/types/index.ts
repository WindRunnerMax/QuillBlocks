import type { RawRange } from "../../selection/modules/raw-range";

/** End Of Line */
export const EOL = "\n";

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

export type ApplyOptions = { source?: string; range?: RawRange };
