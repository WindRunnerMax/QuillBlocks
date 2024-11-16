import "./styles/index.scss";

import type { SerializeContext } from "block-kit-core";
import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { INLINE_CODE } from "./types";

export class InlineCodePlugin extends EditorPlugin {
  public key = INLINE_CODE;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(INLINE_CODE, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [INLINE_CODE]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[INLINE_CODE];
  }

  public serialize(context: SerializeContext): void {
    const { op, html } = context;
    if (op.attributes && op.attributes[INLINE_CODE]) {
      const strong = document.createElement("code");
      strong.appendChild(html);
      context.html = strong;
    }
  }

  public render(context: ReactLeafContext): ReactNode {
    return <code className="inline-code">{context.children}</code>;
  }
}
