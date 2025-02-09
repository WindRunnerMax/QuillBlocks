import type { Editor } from "block-kit-core";
import { EDITOR_EVENT, Point, RawPoint } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { EventContext } from "block-kit-utils";
import { Bind, KEY_CODE } from "block-kit-utils";

import { INDENT_LEVEL_KEY } from "./types";

export class IndentPlugin extends EditorPlugin {
  public key = INDENT_LEVEL_KEY;

  constructor(protected editor: Editor) {
    super();
    editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeydown);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[INDENT_LEVEL_KEY];
  }

  public renderLine(context: ReactLineContext): React.ReactNode {
    const attrs = context.attributes;
    const level = Number(attrs[INDENT_LEVEL_KEY]);
    if (!isNaN(level)) {
      context.style.paddingLeft = `${level * 25}px`;
    }

    return context.children;
  }

  @Bind
  protected onKeydown(event: KeyboardEvent, context: EventContext): void {
    if (event.keyCode !== KEY_CODE.TAB) return void 0;
    const sel = this.editor.selection.get();
    if (!sel) return void 0;
    const { start, end } = sel;
    const block = this.editor.state.block;
    const rawPoint = RawPoint.fromPoint(this.editor, Point.from(start.line, 0));
    if (!rawPoint) return void 0;
    const delta = new Delta();
    delta.retain(rawPoint.offset);
    for (let i = start.line; i <= end.line; i++) {
      const lineState = block.getLine(i);
      if (!lineState) break;
      delta.retain(lineState.length - 1);
      const attrs = lineState.attributes;
      const current = Number(attrs[INDENT_LEVEL_KEY]) || 0;
      const ins = event.shiftKey ? -1 : 1;
      const next = Math.max(0, current + ins);
      delta.retain(1, {
        [INDENT_LEVEL_KEY]: next ? next.toString() : "",
      });
    }
    this.editor.state.apply(delta);
    context.stop();
    event.preventDefault();
    event.stopPropagation();
  }
}
