import type { AttributeMap } from "block-kit-delta";

import type { Range } from "../../selection/modules/range";

export type CMDPayload = {
  value: string;
  range?: Range;
  attrs?: AttributeMap;
  [key: string]: unknown;
};

export type CMDFunc = (data: CMDPayload) => void | Promise<void>;

export type EditorCMD = Record<string, CMDFunc>;
