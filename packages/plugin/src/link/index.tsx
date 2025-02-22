import type { Editor } from "block-kit-core";
import type { CMDPayload } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext, ReactWrapLeafContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { Bind } from "block-kit-utils";

import { LINK_KEY, LINK_TEMP_KEY } from "./types";
import { A } from "./view/a";

export class LinkPlugin extends EditorPlugin {
  public key = LINK_KEY;
  protected modal: HTMLDivElement | null;

  constructor(protected editor: Editor) {
    super();
    this.modal = null;
    editor.command.register(this.key, this.onExec);
  }

  public destroy(): void {
    this.modal && this.modal.remove();
    this.modal = null;
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[LINK_KEY] || !!attrs[LINK_TEMP_KEY];
  }

  public wrapLeafKeys = [LINK_KEY];
  public wrapLeaf(context: ReactWrapLeafContext): React.ReactNode {
    const state = context.leafState;
    const attrs = state.op.attributes || {};
    const href = attrs[LINK_KEY];
    if (!href) return context.children;
    return <A attrs={attrs}>{context.children}</A>;
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    const attrs = context.attributes;
    if (attrs && attrs[LINK_TEMP_KEY]) {
      context.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    }
    return context.children;
  }

  @Bind
  public onExec(payload: CMDPayload) {
    const range = this.editor.selection.get() || payload.range;
    const attrs = payload.attrs;
    if (!range || attrs) return void 0;
  }
}
