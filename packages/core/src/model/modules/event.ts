import type { Range } from "blocks-kit-shared";

import type { Editor } from "../../editor";
import type { BlockModel } from "..";

export class EditableEvent {
  constructor(private readonly engine: Editor, private readonly parent: BlockModel) {}

  public onSelectionChange = (range: Range) => {
    // !: 由于根节点无`EDITABLE_KEY`无法跨`Block`选区
    // 且如果通过`EDITABLE_KEY`跨`Block`实现选区会无法触发事件
    // 跨`Block`选区的事件监听则应该通过`DOM`取得`Editable`来处理
    const blockId = this.parent.block.id;
    console.log("BlockId, Range:", blockId, range);
  };

  public onInputEnter = () => {
    // !: 控制`Block`引擎创建`Line`
    console.log("Input Enter");
    return false;
  };
}
