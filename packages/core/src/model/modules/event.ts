import type { Editor } from "../../editor";
import type { BlockModel } from "..";

export class EditableEvent {
  constructor(private readonly engine: Editor, private readonly parent: BlockModel) {}

  public onSelectionChange = () => {
    // !: 需要观察在`Block`销毁时是否会发生内存泄漏 use:
    // !: 由于根节点无`EDITABLE_KEY`无法跨`Block`选区
    // 且如果通过`EDITABLE_KEY`配置跨`Block`选区会无法触发事件
    // 则跨`Block`选区的事件监听应该通过`DOM`取得`Editable`来处理
  };

  public onInputEnter = () => {
    // !: 控制`Block`引擎创建`Line`
    console.log("Input Enter");
    return false;
  };
}
