import type { Block } from "blocks-kit-delta";
import { Editable } from "blocks-kit-shared";

import type { EditorState } from "../index";
import { DATA_BLOCK_ID_KEY, DATA_BLOCK_KEY, DATA_LINE_KEY, EDITABLE_KEY } from "../utils/constant";

export class BlockState {
  public start: number;
  public editor: Editable | null;
  public readonly id: string;
  public _parent: BlockState | null;
  public readonly children: BlockState[];
  constructor(private engine: EditorState, private readonly block: Block) {
    this.start = 0;
    this.editor = null;
    this.id = block.id;
    this._parent = null;
    this.children = [];
  }

  public get parent() {
    return this._parent;
  }

  public getRaw() {
    return this.block;
  }

  public getLine(index: number): BlockState | null {
    return this.children[index];
  }

  public getLines() {
    return this.children;
  }

  public setParent(parent: BlockState | null) {
    this._parent = parent;
  }

  public addChild(child: BlockState) {
    child.setParent(this);
    this.children.push(child);
  }

  public getAttr(key: string): string | null {
    return this.block.attributes[key] || null;
  }

  public render() {
    const div = document.createElement("div");
    div.setAttribute(DATA_BLOCK_ID_KEY, this.id);
    this.engine.model.setBlockModel(this, div);
    if (this.children.length) {
      div.setAttribute(DATA_BLOCK_KEY, "true");
      div.setAttribute(EDITABLE_KEY, "false");
      for (const child of this.children) {
        const dom = child.render();
        div.appendChild(dom);
      }
    } else {
      div.setAttribute(DATA_LINE_KEY, "true");
      // !: Need registry
      this.editor = new Editable(div);
      this.editor.setContents(this.block.ops);
    }
    return div;
  }
}
