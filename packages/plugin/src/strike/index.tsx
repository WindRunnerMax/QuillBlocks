import type { DeserializeContext, SerializeContext } from "block-kit-core";
import type { Editor } from "block-kit-core";
import { applyMarker, isMatchHTMLTag } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { isHTMLElement, TRULY } from "block-kit-utils";
import type { ReactNode } from "react";

import { STRIKE_KEY } from "./types";

export class StrikePlugin extends EditorPlugin {
  public key = STRIKE_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(STRIKE_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyMarks(sel, { [STRIKE_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[STRIKE_KEY];
  }

  public serialize(context: SerializeContext): SerializeContext {
    const { op, html } = context;
    if (op.attributes && op.attributes[STRIKE_KEY]) {
      const strong = document.createElement("del");
      strong.appendChild(html);
      context.html = strong;
    }
    return context;
  }

  public deserialize(context: DeserializeContext): DeserializeContext {
    const { delta, html } = context;
    if (!isHTMLElement(html)) return context;
    if (
      isMatchHTMLTag(html, "s") ||
      isMatchHTMLTag(html, "del") ||
      html.style.textDecorationLine === "line-through"
    ) {
      applyMarker(delta, { [STRIKE_KEY]: TRULY });
    }
    return context;
  }

  public render(context: ReactLeafContext): ReactNode {
    context.style.textDecoration = context.style.textDecoration
      ? context.style.textDecoration + " line-through"
      : "line-through";
    return context.children;
  }
}
