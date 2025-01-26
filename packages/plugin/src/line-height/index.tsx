import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { LINE_HEIGHT_KEY } from "./types";

export class LineHeightPlugin extends EditorPlugin {
  public key = LINE_HEIGHT_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(LINE_HEIGHT_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyLineMarks(sel, { [LINE_HEIGHT_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[LINE_HEIGHT_KEY];
  }

  public renderLine(context: ReactLineContext): ReactNode {
    const attrs = context.attributes || {};
    const height = attrs[LINE_HEIGHT_KEY];
    context.style.lineHeight = height as typeof context.style.lineHeight;
    return context.children;
  }
}
