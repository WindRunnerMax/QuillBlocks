import type { DeserializeContext, SerializeContext } from "block-kit-core";
import type { Editor } from "block-kit-core";
import { applyMarker, isMatchHTMLTag } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { isHTMLElement, TRULY } from "block-kit-utils";
import type { ReactNode } from "react";

import { ITALIC_KEY } from "./types";

export class ItalicPlugin extends EditorPlugin {
  public key = ITALIC_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(ITALIC_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [ITALIC_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[ITALIC_KEY];
  }

  public serialize(context: SerializeContext): SerializeContext {
    const { op, html } = context;
    if (op.attributes && op.attributes[ITALIC_KEY]) {
      const strong = document.createElement("em");
      strong.appendChild(html);
      context.html = strong;
    }
    return context;
  }

  public deserialize(context: DeserializeContext): DeserializeContext {
    const { delta, html } = context;
    if (!isHTMLElement(html)) return context;
    if (isMatchHTMLTag(html, "em") || html.style.fontStyle === "italic") {
      applyMarker(delta, { [ITALIC_KEY]: TRULY });
    }
    return context;
  }

  public renderLeaf(context: ReactLeafContext): ReactNode {
    context.style.fontStyle = "italic";
    return context.children;
  }
}
