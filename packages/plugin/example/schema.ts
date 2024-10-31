import type { EditorSchema } from "block-kit-core";

import { BOLD_KEY } from "../src/bold/types";
import { IMAGE_KEY } from "../src/image/types";
import { INLINE_CODE } from "../src/inline-code/types";
import { MENTION_KEY } from "../src/mention/types";

export const schema: EditorSchema = {
  [BOLD_KEY]: {
    mark: true,
  },
  [IMAGE_KEY]: {
    block: true,
    void: true,
  },
  [MENTION_KEY]: {
    void: true,
    inline: true,
  },
  [INLINE_CODE]: {
    mark: true,
    notTailMark: true,
  },
};
