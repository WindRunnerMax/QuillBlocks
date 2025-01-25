import type { Editor } from "block-kit-core";

import { BOLD_KEY } from "../../bold/types";
import { INLINE_CODE } from "../../inline-code/types";

export const TOOLBAR_TYPES = [BOLD_KEY, INLINE_CODE] as const;
export const TOOLBAR_KEY_SET = new Set(TOOLBAR_TYPES);

export type ToolbarProps = {
  editor: Editor;
  className?: string;
  children: React.ReactNode;
};
