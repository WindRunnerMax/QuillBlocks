import type { DeserializeContext, SerializeContext } from "block-kit-core";
import type { Editor } from "block-kit-core";
import { applyMarker, isMatchHTMLTag } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { isHTMLElement, TRUE } from "block-kit-utils";
import type { ReactNode } from "react";

import { UNDERLINE_KEY } from "./types";

export class UnderlinePlugin extends EditorPlugin {
  public key = UNDERLINE_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(UNDERLINE_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [UNDERLINE_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[UNDERLINE_KEY];
  }

  public serialize(context: SerializeContext): SerializeContext {
    const { op, html } = context;
    if (op.attributes && op.attributes[UNDERLINE_KEY]) {
      const strong = document.createElement("u");
      strong.appendChild(html);
      context.html = strong;
    }
    return context;
  }

  public deserialize(context: DeserializeContext): DeserializeContext {
    const { delta, html } = context;
    if (!isHTMLElement(html)) return context;
    if (isMatchHTMLTag(html, "u") || html.style.textDecoration === "underline") {
      applyMarker(delta, { [UNDERLINE_KEY]: TRUE });
    }
    return context;
  }

  public render(context: ReactLeafContext): ReactNode {
    context.style.textDecoration = context.style.textDecoration
      ? context.style.textDecoration + " underline"
      : "underline";
    return context.children;
  }
}
