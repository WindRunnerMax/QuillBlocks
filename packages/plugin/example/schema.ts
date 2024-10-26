import type { EditorSchema } from "block-kit-core";

import { BOLD_KEY } from "../src/bold/types";
import { IMAGE_KEY } from "../src/image/types";
import { MENTION_KEY } from "../src/mention/types";

export const schema: EditorSchema = {
  [BOLD_KEY]: {
    tailMark: true,
  },
  [IMAGE_KEY]: {
    block: true,
    void: true,
  },
  [MENTION_KEY]: {
    void: true,
    inline: true,
  },
};
