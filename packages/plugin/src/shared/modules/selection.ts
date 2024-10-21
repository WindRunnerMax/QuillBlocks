import type { Editor, SelectionChangeEvent } from "block-kit-core";
import { EDITOR_EVENT } from "block-kit-core";

import type { SelectionHOC } from "../components/selection";

export class SelectionPlugin {
  protected idToView: Map<string, SelectionHOC>;

  constructor(protected editor: Editor, public readonly: boolean) {
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

  public onSelectionChange = (e: SelectionChangeEvent) => {
    const current = e.current;
    this.idToView.forEach(view => {
      view.onSelectionChange(current);
    });
  };
}
