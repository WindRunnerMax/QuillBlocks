import type { BlockSet } from "blocks-kit-delta";

import type { LOG_LEVEL } from "../log";

export type EditorOptions = {
  blockSet?: BlockSet;
  logLevel?: typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
};
