import "./styles/index.scss";

import type { CMDPayload, Editor } from "block-kit-core";
import { Point, Range } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { Void } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { Bind, TRULY } from "block-kit-utils";
import type { ReactNode } from "react";

import { SelectionHOC } from "../shared/components/selection";
import { SelectionPlugin } from "../shared/modules/selection";
import { isEmptyLine } from "../shared/utils/is";
import { DIVIDER_KEY } from "./types";

export class DividerPlugin extends EditorPlugin {
  public key = DIVIDER_KEY;
  public selection: SelectionPlugin;

  constructor(protected editor: Editor) {
    super();
    this.selection = new SelectionPlugin(editor);
    editor.command.register(DIVIDER_KEY, this.onExec);
  }

  public destroy(): void {
    this.selection.destroy();
  }

  @Bind
  protected onExec(context: CMDPayload) {
    const editor = this.editor;
    const sel = editor.selection.get() || context.range;
    const line = sel && editor.state.block.getLine(sel.start.line);
    if (!sel || !line) return void 0;
    const isEmptyTextLine = isEmptyLine(line);
    let nextLineIndex = line.index + 1;
    const delta = new Delta();
    if (isEmptyTextLine) {
      // 当前选区为空行
      delta.retain(line.start);
    } else {
      // 移动选区到当前行最后
      delta.retain(line.start + line.length);
    }
    delta.insert(" ", { [DIVIDER_KEY]: TRULY }).insertEOL();
    if (!isEmptyTextLine) {
      nextLineIndex++;
      delta.insertEOL();
    }
    const point = new Point(nextLineIndex, 0);
    editor.state.apply(delta, { autoCaret: false });
    editor.selection.set(new Range(point, point.clone()));
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[DIVIDER_KEY];
  }

  public renderLeaf(context: ReactLeafContext): ReactNode {
    return (
      <SelectionHOC selection={this.selection} leaf={context.leafState}>
        <Void tag="div" className="block-kit-divider-container" context={context}>
          <div className="block-kit-divider"></div>
        </Void>
      </SelectionHOC>
    );
  }
}
