import "./styles/index.scss";

import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { Embed } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { MENTION_KEY, MENTION_NAME } from "./types";

export class MentionPlugin extends EditorPlugin {
  public key = MENTION_KEY;

  constructor() {
    super();
  }

  public destroy(): void {}

  public match(attrs: AttributeMap): boolean {
    return !!attrs[MENTION_KEY];
  }

  public render(context: ReactLeafContext): ReactNode {
    const attrs = context.attributes || {};
    const name = attrs[MENTION_NAME] || "";
    return (
      <Embed className="block-kit-mention-embed" context={context}>
        <span className="mention-name">@{name}</span>
      </Embed>
    );
  }
}
