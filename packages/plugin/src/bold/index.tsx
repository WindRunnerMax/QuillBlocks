import type { AttributeMap } from "block-kit-delta";
import type { LeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { BOLD_KEY } from "./types";

export class BoldPlugin extends EditorPlugin {
  public key = BOLD_KEY;
  public destroy(): void {}

  public match(attrs: AttributeMap): boolean {
    return !!attrs[BOLD_KEY];
  }

  public render(context: LeafContext): ReactNode {
    context.style.fontWeight = "bold";
    return context.children;
  }
}
