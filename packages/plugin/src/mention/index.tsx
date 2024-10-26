import "./styles/index.scss";

import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { Embed } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { SelectionHOC } from "../shared/components/selection";
import { SelectionPlugin } from "../shared/modules/selection";
import { MENTION_KEY, MENTION_NAME } from "./types";

export class MentionPlugin extends EditorPlugin {
  public key = MENTION_KEY;
  public selection: SelectionPlugin;

  constructor(editor: Editor, readonly: boolean) {
    super();
    this.selection = new SelectionPlugin(editor, readonly);
  }

  public destroy(): void {
    this.selection.destroy();
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[MENTION_KEY];
  }

  public render(context: ReactLeafContext): ReactNode {
    const attrs = context.attributes || {};
    const name = attrs[MENTION_NAME] || "";
    return (
      <Embed className="editor-mention-embed" context={context}>
        <SelectionHOC selection={this.selection} leaf={context.leafState} border={false}>
          <span className="mention-name">@{name}</span>
        </SelectionHOC>
      </Embed>
    );
  }
}
