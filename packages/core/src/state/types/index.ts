import type { RawRange } from "../../selection/modules/raw-range";

/** End Of Line */
export const EOL = "\n";

export const EDITOR_STATE = {
  COMPOSING: "COMPOSING",
  MOUNTED: "MOUNTED",
  READONLY: "READONLY",
  MOUSE_DOWN: "MOUSE_DOWN",
  FOCUS: "FOCUS",
} as const;

export type ApplyOptions = { source?: string; range?: RawRange };
