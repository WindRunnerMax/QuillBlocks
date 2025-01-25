import type { EditorSchema } from "block-kit-core";
import { BOLD_KEY } from "block-kit-plugin";
import { IMAGE_KEY } from "block-kit-plugin";
import { INLINE_CODE } from "block-kit-plugin";
import { MENTION_KEY } from "block-kit-plugin";

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
    inline: true,
  },
};
