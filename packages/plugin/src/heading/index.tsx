import "./styles/index.scss";

import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { HEADING_KEY } from "./types";

export class HeadingPlugin extends EditorPlugin {
  public key = HEADING_KEY;
  public destroy(): void {}

  constructor(editor: Editor) {
    super();
    editor.command.register(HEADING_KEY, context => {
      const sel = editor.selection.get();
      sel && editor.perform.applyLineMarks(sel, { [HEADING_KEY]: context.value });
    });
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[HEADING_KEY];
  }

  public renderLine(context: ReactLineContext): ReactNode {
    const attrs = context.attributes || {};
    const level = attrs[HEADING_KEY];
    switch (level) {
      case "h1":
        return <div className="heading h1">{context.children}</div>;
      case "h2":
        return <div className="heading h2">{context.children}</div>;
      case "h3":
        return <div className="heading h3">{context.children}</div>;
      default:
        break;
    }
    return context.children;
  }
}
