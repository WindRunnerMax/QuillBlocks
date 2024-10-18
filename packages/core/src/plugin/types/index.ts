import type { F, O } from "block-kit-utils/dist/es/types";

import type { CorePlugin } from "../modules/implement";

export const CALLER_TYPE = {
  SERIALIZE: "serialize",
  DESERIALIZE: "deserialize",
  WILL_SET_CLIPBOARD: "willSetToClipboard",
  WILL_PASTE_NODES: "willApplyPasteNodes",
} as const;

export type CallerMap = {
  [CALLER_TYPE.SERIALIZE]: PickPluginType<typeof CALLER_TYPE.SERIALIZE>;
  [CALLER_TYPE.DESERIALIZE]: PickPluginType<typeof CALLER_TYPE.DESERIALIZE>;
  [CALLER_TYPE.WILL_SET_CLIPBOARD]: PickPluginType<typeof CALLER_TYPE.WILL_SET_CLIPBOARD>;
  [CALLER_TYPE.WILL_PASTE_NODES]: PickPluginType<typeof CALLER_TYPE.WILL_PASTE_NODES>;
};

export type PluginType = keyof CorePlugin;
export type RequiredPlugin = Required<CorePlugin>;
export type CallerType = O.Values<typeof CALLER_TYPE>;
export type PickPluginType<key extends PluginType> = RequiredPlugin[key] extends F.Any
  ? Parameters<RequiredPlugin[key]>[0]
  : null;
