import type { Range } from "blocks-kit-shared";

import type { Editor } from "../../editor";
import type { BlockModel } from "..";

export class EditableEvent {
  constructor(private readonly engine: Editor, private readonly parent: BlockModel) {}

  public readonly onSelectionChange = (range: Range) => {
    const blockId = this.parent.block.id;
    console.log("blockId, range :>> ", blockId, range);
  };
}
