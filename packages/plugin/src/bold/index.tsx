import type { DeserializeContext, SerializeContext } from "block-kit-core";
import { applyMarker, isMatchHTMLTag } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { isHTMLElement, TRUE } from "block-kit-utils";
import type { ReactNode } from "react";

import { BOLD_KEY } from "./types";

export class BoldPlugin extends EditorPlugin {
  public key = BOLD_KEY;
  public destroy(): void {}

  public match(attrs: AttributeMap): boolean {
    return !!attrs[BOLD_KEY];
  }

  public serialize(context: SerializeContext): void {
    const { op, html } = context;
    if (op.attributes && op.attributes[BOLD_KEY]) {
      const strong = document.createElement("strong");
      // 采用 Wrap Base Node 加原地替换的方式
      strong.appendChild(html);
      context.html = strong;
    }
  }

  public deserialize(context: DeserializeContext): void {
    const { delta, html } = context;
    if (!isHTMLElement(html)) {
      return void 0;
    }
    if (
      isMatchHTMLTag(html, "strong") ||
      isMatchHTMLTag(html, "b") ||
      html.style.fontWeight === "bold"
    ) {
      applyMarker(delta, BOLD_KEY, TRUE);
    }
  }

  public render(context: ReactLeafContext): ReactNode {
    context.style.fontWeight = "bold";
    return context.children;
  }
}
