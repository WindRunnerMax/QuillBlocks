import type { Delta } from "block-kit-delta";
import type { O } from "block-kit-utils/dist/es/types";

import type { LOG_LEVEL } from "../../log";
import type { EditorSchema } from "../../schema/types";

export type EditorOptions = {
  delta?: Delta;
  schema?: EditorSchema;
  logLevel?: O.Values<typeof LOG_LEVEL>;
};
