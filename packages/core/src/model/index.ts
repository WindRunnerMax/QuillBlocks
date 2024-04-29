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
      const modules = {
        keyboard: {
          bindings: {
            ENTER: { key: "Enter", handler: this.event.onInputEnter },
          },
        },
      };
      this.editable = new Editable(dom, { modules });
    }
    return this.editable;
  }

  public setContent(ops: Ops) {
    const editor = this.getEditor();
    editor.setContents(ops);
  }
}
