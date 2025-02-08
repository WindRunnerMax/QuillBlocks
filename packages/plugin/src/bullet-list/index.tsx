import "./styles/index.scss";

import type { CMDPayload, Editor } from "block-kit-core";
import { Point, RawPoint } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { Bind, NIL, TRULY } from "block-kit-utils";
import type { ReactNode } from "react";

import { INDENT_LEVEL_KEY } from "../indent/types";
import { BULLET_LIST_KEY } from "./types";
import { ListView } from "./view/list";

export class BulletListPlugin extends EditorPlugin {
  public key = BULLET_LIST_KEY;
  public destroy(): void {}

  constructor(protected editor: Editor) {
    super();
    editor.command.register(BULLET_LIST_KEY, this.onExec);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[BULLET_LIST_KEY] && !!attrs[INDENT_LEVEL_KEY];
  }

  public renderLine(context: ReactLineContext): ReactNode {
    const level = Number(context.attributes[INDENT_LEVEL_KEY]);
    if (isNaN(level)) return context.children;
    return (
      <ListView level={level} editor={this.editor} context={context}>
        {context.children}
      </ListView>
    );
  }

  @Bind
  protected onExec(payload: CMDPayload) {
    const editor = this.editor;
    const sel = editor.selection.get() || payload.range;
    if (!sel) return void 0;
    const { start, end } = sel;
    const lines = editor.state.block.getLines().slice(start.line, end.line + 1);
    const isBullet = lines.every(line => line.attributes[BULLET_LIST_KEY]);
    const rawPoint = RawPoint.fromPoint(this.editor, Point.from(start.line, 0));
    if (!rawPoint) return void 0;
    const block = this.editor.state.block;
    const delta = new Delta();
    delta.retain(rawPoint.offset);
    for (let i = start.line; i <= end.line; i++) {
      const lineState = block.getLine(i);
      if (!lineState) break;
      delta.retain(lineState.length - 1);
      const attrs: AttributeMap = {
        [BULLET_LIST_KEY]: isBullet ? NIL : TRULY,
      };
      if (!isBullet) {
        attrs[INDENT_LEVEL_KEY] = lineState.attributes[INDENT_LEVEL_KEY] || "0";
      }
      delta.retain(1, attrs);
    }
    this.editor.state.apply(delta, { autoCaret: false });
  }
}
