import { Delta } from "block-kit-delta";
import { isDOMText, TEXT_PLAIN } from "block-kit-utils";

import type { Editor } from "../../editor";
import { CALLER_TYPE } from "../../plugin/types";
import type { DeserializeContext, PasteContext } from "../types";

export class Paste {
  constructor(private editor: Editor) {}

  /**
   * 处理剪贴板 Delta
   * @param delta
   */
  public applyDelta(delta: Delta) {
    const context: PasteContext = { delta };
    this.editor.plugin.call(CALLER_TYPE.WILL_PASTE_NODES, context);
    this.editor.logger.info("Editor Will Apply:", context.delta);
    try {
      const sel = this.editor.selection.get();
      sel && this.editor.perform.insertFragment(sel, context.delta);
    } catch (error) {
      this.editor.logger.error("InsertFragment Error:", error, context.delta);
    }
  }

  /**
   * 处理剪贴板纯文本
   * @param transfer
   */
  public applyPlainText(transfer: DataTransfer) {
    const text = transfer.getData(TEXT_PLAIN) || "";
    const sel = this.editor.selection.get();
    sel && this.editor.perform.insertText(sel, text);
  }

  /**
   * 处理文件数据
   * @param files
   */
  public applyFiles(files: File[]) {
    const root = document.createDocumentFragment();
    const context: DeserializeContext = { html: root, delta: new Delta(), files };
    this.editor.plugin.call(CALLER_TYPE.DESERIALIZE, context);
    this.applyDelta(context.delta);
  }

  /**
   * 反序列化 HTML 为 Delta
   * @param current
   */
  public deserialize(current: Node): Delta {
    const delta = new Delta();
    // 结束条件 Text、Image 等节点都会在此时处理
    if (!current.childNodes.length) {
      if (isDOMText(current)) {
        const text = current.textContent || "";
        delta.insert(text);
      } else {
        const context: DeserializeContext = { delta, html: current };
        this.editor.plugin.call(CALLER_TYPE.DESERIALIZE, context);
      }
      return delta;
    }
    const children = Array.from(current.childNodes);
    for (const child of children) {
      const newDelta = this.deserialize(child);
      delta.ops.push(...newDelta.ops);
    }
    const context: DeserializeContext = { delta, html: current };
    this.editor.plugin.call(CALLER_TYPE.DESERIALIZE, context);
    return context.delta;
  }
}
