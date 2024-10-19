import type { EditorSchema } from "block-kit-core";

import { BOLD_KEY } from "../src/bold/types";
import { IMAGE_KEY } from "../src/image/types";

export const schema: EditorSchema = {
  [BOLD_KEY]: {
    tailMark: true,
  },
  [IMAGE_KEY]: {
    block: true,
    void: true,
  },
};
