import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { EditorPlugin } from "block-kit-react";

import type { ReactWrapLeafContext } from "../../../react/src/plugin";
import { LINK_BLANK_KEY, LINK_KEY } from "./types";

export class LinkPlugin extends EditorPlugin {
  public key = LINK_KEY;
  public destroy(): void {}

  constructor(protected editor: Editor) {
    super();
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[LINK_KEY];
  }

  public wrapLeafKeys = [LINK_KEY];
  public wrapLeaf(context: ReactWrapLeafContext): React.ReactNode {
    const state = context.leafState;
    const attrs = state.op.attributes || {};
    const href = attrs[LINK_KEY];
    const target = attrs[LINK_BLANK_KEY] ? "_blank" : "_self";
    return (
      <a href={href} target={target} rel="noreferrer">
        {context.children}
      </a>
    );
  }
}
