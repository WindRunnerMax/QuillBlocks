import type { Editor, SelectionChangeEvent } from "block-kit-core";
import { EDITOR_EVENT } from "block-kit-core";
import { Bind } from "block-kit-utils";

import type { SelectionHOC } from "../components/selection";
export class SelectionPlugin {
  /** id <-> React.ReactNode */
  protected idToView: Map<string, SelectionHOC>;

  constructor(public editor: Editor) {
    this.idToView = new Map();
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  public destroy(): void {
    this.idToView.clear();
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  public mountView(id: string, view: SelectionHOC) {
    this.idToView.set(id, view);
  }

  public unmountView(id: string) {
    this.idToView.delete(id);
  }

  @Bind
  protected onSelectionChange(e: SelectionChangeEvent) {
    const current = e.current;
    this.idToView.forEach(view => {
      view.onSelectionChange(current);
    });
  }
}
