import type { LOG_LEVEL } from "../log";

export type EditorOptions = {
  logLevel?: typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
};
