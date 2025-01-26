import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { ALIGN_KEY } from "./types";

export class AlignPlugin extends EditorPlugin {
  public key = ALIGN_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(ALIGN_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyLineMarks(sel, { [ALIGN_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[ALIGN_KEY];
  }

  public renderLine(context: ReactLineContext): ReactNode {
    const attrs = context.attributes || {};
    const align = attrs[ALIGN_KEY];
    context.style.textAlign = align as typeof context.style.textAlign;
    return context.children;
  }
}
