import type { EditorSchema } from "block-kit-core";
import { BOLD_KEY, ITALIC_KEY, STRIKE_KEY, UNDERLINE_KEY } from "block-kit-plugin";
import { IMAGE_KEY } from "block-kit-plugin";
import { INLINE_CODE } from "block-kit-plugin";
import { MENTION_KEY } from "block-kit-plugin";

export const schema: EditorSchema = {
  [BOLD_KEY]: {
    mark: true,
  },
  [ITALIC_KEY]: {
    mark: true,
  },
  [UNDERLINE_KEY]: {
    mark: true,
  },
  [STRIKE_KEY]: {
    mark: true,
  },
  [INLINE_CODE]: {
    mark: true,
    inline: true,
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
