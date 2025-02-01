import type { Range } from "../../selection/modules/range";

export type CMDPayload = {
  value: string;
  range?: Range;
  [key: string]: unknown;
};

export type CMDFunc = (data: CMDPayload) => void | Promise<void>;

export type EditorCMD = Record<string, CMDFunc>;
