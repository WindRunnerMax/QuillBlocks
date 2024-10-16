import type { LeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { BOLD_KEY } from "./types";

export class BoldPlugin extends EditorPlugin {
  static KEY = BOLD_KEY;

  match(key: string): boolean {
    return key === BoldPlugin.KEY;
  }

  render(context: LeafContext): ReactNode {
    context.style.fontWeight = "bold";
    return context.children;
  }
}
