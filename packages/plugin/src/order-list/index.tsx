import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { ORDER_LIST_KEY } from "./types";

export class OrderListPlugin extends EditorPlugin {
  public key = ORDER_LIST_KEY;
  public destroy(): void {}

  constructor(protected editor: Editor) {
    super();
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[ORDER_LIST_KEY];
  }

  public renderLine(context: ReactLineContext): ReactNode {
    return context.children;
  }
}
