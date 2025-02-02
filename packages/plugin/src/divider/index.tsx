import "./styles/index.scss";

import type { Editor } from "block-kit-core";
import { Point, Range } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { Void } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { TRUE } from "block-kit-utils";
import type { ReactNode } from "react";

import { SelectionHOC } from "../shared/components/selection";
import { SelectionPlugin } from "../shared/modules/selection";
import { DIVIDER_KEY } from "./types";

export class DividerPlugin extends EditorPlugin {
  public key = DIVIDER_KEY;
  public selection: SelectionPlugin;

  constructor(editor: Editor, readonly: boolean) {
    super();
    this.selection = new SelectionPlugin(editor, readonly);
    editor.command.register(DIVIDER_KEY, context => {
      const sel = editor.selection.get() || context.range;
      const line = sel && editor.state.block.getLine(sel.start.line);
      if (!sel || !line) return void 0;
      let point: Point | null = null;
      const delta = new Delta();
      if (line.length < 2) {
        // 当前选区为空行
        delta
          .retain(line.start)
          .insert(" ", { [DIVIDER_KEY]: TRUE })
          .insertEOL();
        point = new Point(line.index + 1, 0);
      } else {
        // 移动选区到当前行最后
        delta
          .retain(line.start + line.length)
          .insert(" ", { [DIVIDER_KEY]: TRUE })
          .insertEOL()
          .insertEOL();
        point = new Point(line.index + 2, 0);
      }
      editor.state.apply(delta, { autoCaret: false });
      editor.selection.set(new Range(point, point.clone()));
    });
  }

  public destroy(): void {
    this.selection.destroy();
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[DIVIDER_KEY];
  }

  public render(context: ReactLeafContext): ReactNode {
    return (
      <SelectionHOC selection={this.selection} leaf={context.leafState}>
        <Void tag="div" className="block-kit-divider-container" context={context}>
          <div className="block-kit-divider"></div>
        </Void>
      </SelectionHOC>
    );
  }
}
