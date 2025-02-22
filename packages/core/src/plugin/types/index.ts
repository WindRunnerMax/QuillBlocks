import type { F, O } from "block-kit-utils/dist/es/types";

import type { CorePlugin } from "../modules/implement";

export type PluginType = keyof CorePlugin;
export type RequiredPlugin = Required<CorePlugin>;
export type CallerType = O.Values<typeof CALLER_TYPE>;

export const CALLER_TYPE = {
  SERIALIZE: "serialize",
  DESERIALIZE: "deserialize",
  WILL_SET_CLIPBOARD: "willSetToClipboard",
  WILL_PASTE_NODES: "willApplyPasteNodes",
} as const;

export const PLUGIN_TYPE = {
  ...CALLER_TYPE,
  RENDER_LINE: "renderLine",
  RENDER_LEAF: "renderLeaf",
} as const;

export type CallerMap = {
  [P in CallerType]: PickPluginFunc<P>;
};

export type PluginFuncKeys = Exclude<
  O.Values<{
    [key in PluginType]: RequiredPlugin[key] extends F.Any ? key : never;
  }>,
  "destroy" | "match"
>;

export type PickPluginFunc<key extends PluginType> = RequiredPlugin[key] extends F.Any
  ? Parameters<RequiredPlugin[key]>[0]
  : null;

export type PluginRequiredKeyFunc<T extends PluginFuncKeys> = CorePlugin &
  Required<{
    [K in T]: RequiredPlugin[K];
  }>;
