import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { BACKGROUND_KEY } from "./types";

export class BackgroundPlugin extends EditorPlugin {
  public key = BACKGROUND_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(BACKGROUND_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [BACKGROUND_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[BACKGROUND_KEY];
  }

  public render(context: ReactLeafContext): ReactNode {
    const attrs = context.attributes || {};
    const background = attrs[BACKGROUND_KEY];
    if (background) {
      context.style.backgroundColor = background;
    }
    return context.children;
  }
}
