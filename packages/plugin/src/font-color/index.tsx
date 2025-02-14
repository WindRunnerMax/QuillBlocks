import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { FONT_COLOR_KEY } from "./types";

export class FontColorPlugin extends EditorPlugin {
  public key = FONT_COLOR_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(FONT_COLOR_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [FONT_COLOR_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[FONT_COLOR_KEY];
  }

  public renderLeaf(context: ReactLeafContext): ReactNode {
    const attrs = context.attributes || {};
    const color = attrs[FONT_COLOR_KEY];
    if (color) {
      context.style.color = color;
    }
    return context.children;
  }
}
