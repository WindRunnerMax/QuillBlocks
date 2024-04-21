import { Editable, EmbedBlot } from "blocks-kit-shared";

export class BlockEditor extends EmbedBlot {
  static tagName: string = "div";
  static blotName: string = "block";
  static className: string = "zone-block";

  static create() {
    const node = super.create() as HTMLDivElement;
    const editor = new Editable(node);
    // @ts-expect-error undeclared property
    node.__instance__ = editor;
    return node;
  }
}

Editable.register(BlockEditor);

// https://www.npmjs.com/package/parchment
// https://www.cnblogs.com/Grewer/p/17430021.html
