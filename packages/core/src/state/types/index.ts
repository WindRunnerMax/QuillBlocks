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
  /** 用户触发 默认值 */
  USER: "USER",
  /** 远程触发 协同值 */
  REMOTE: "REMOTE",
  /** History 模块触发值 */
  HISTORY: "HISTORY",
};

export type ApplyOptions = {
  /** 操作源 */
  source?: O.Values<typeof APPLY_SOURCE>;
  /** 当前 Raw Modal Range */
  range?: RawRange;
  /** 自动变换光标 */
  autoCaret?: boolean;
};

export type ApplyResult = {
  /** 操作 id */
  id: string;
};
