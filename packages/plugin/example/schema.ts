import type { EditorSchema } from "block-kit-core";

import { BOLD_KEY } from "../src/bold/types";

export const schema: EditorSchema = {
  [BOLD_KEY]: {
    tailMark: true,
  },
};
