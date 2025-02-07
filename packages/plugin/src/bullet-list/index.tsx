import "./styles/index.scss";

import type { CMDPayload, Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { Bind, cs, TRULY } from "block-kit-utils";
import type { ReactNode } from "react";

import { BULLET_LIST_KEY, LIST_LEVEL_KEY } from "./types";

export class BulletListPlugin extends EditorPlugin {
  public key = BULLET_LIST_KEY;
  public destroy(): void {}

  constructor(protected editor: Editor) {
    super();
    editor.command.register(BULLET_LIST_KEY, this.onExec);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[BULLET_LIST_KEY] && !!attrs[LIST_LEVEL_KEY];
  }

  public renderLine(context: ReactLineContext): ReactNode {
    const level = context.attributes[LIST_LEVEL_KEY];
    if (level) {
      return (
        <ul className="block-kit-bullet-list">
          <li className={cs(`block-kit-bullet-item`, `block-kit-li-level-${level}`)}>
            {context.children}
          </li>
        </ul>
      );
    }
    return context.children;
  }

  @Bind
  protected onExec(payload: CMDPayload) {
    const editor = this.editor;
    const sel = editor.selection.get() || payload.range;
    sel && editor.perform.applyLineMarks(sel, { [BULLET_LIST_KEY]: TRULY, [LIST_LEVEL_KEY]: "1" });
  }
}
