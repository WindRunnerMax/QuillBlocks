import type { Ops } from "blocks-kit-delta";
import { Editable } from "blocks-kit-shared";

import type { Editor } from "../editor";
import type { BlockState } from "../state/modules/block";
import { EditableEvent } from "./modules/event";

export class BlockModel {
  private dom: HTMLElement | null;
  private editable: Editable | null;
  private readonly event: EditableEvent;

  constructor(public readonly engine: Editor, public readonly block: BlockState) {
    this.editable = null;
    this.dom = null;
    this.event = new EditableEvent(this.engine, this);
  }

  public setDOMNode(dom: HTMLElement) {
    this.dom = dom;
  }

  public getDOMNode() {
    return this.dom;
  }

  public getEditor() {
    if (!this.editable) {
      if (!this.dom) {
        this.engine.logger.warning("Editor DOM Not Found");
      }
      const dom = this.dom || document.createElement("div");
      // !: 需要根据`Block Type`来决定注册的`Module`
      this.editable = new Editable(dom);
      // !: 需要观察在`Block`销毁时是否会发生内存泄漏
      this.editable.on("selection-change", this.event.onSelectionChange);
    }
    return this.editable;
  }

  public setContent(ops: Ops) {
    const editor = this.getEditor();
    editor.setContents(ops);
  }
}
