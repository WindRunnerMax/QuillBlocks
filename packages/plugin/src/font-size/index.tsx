import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { Styles } from "block-kit-utils";
import type { ReactNode } from "react";

import { FONT_SIZE_KEY } from "./types";

export class FontSizePlugin extends EditorPlugin {
  public key = FONT_SIZE_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(FONT_SIZE_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [FONT_SIZE_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[FONT_SIZE_KEY];
  }

  public renderLeaf(context: ReactLeafContext): ReactNode {
    const attrs = context.attributes || {};
    const size = attrs[FONT_SIZE_KEY];
    if (size) {
      context.style.fontSize = Styles.pixelate(size) as string;
    }
    return context.children;
  }
}
