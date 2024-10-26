import type { Delta } from "block-kit-delta";
import { isEOLOp } from "block-kit-delta";
import { Clipboard, TEXT_HTML, TEXT_PLAIN } from "block-kit-utils";

import type { Editor } from "../../editor";
import { CALLER_TYPE } from "../../plugin/types";
import type { CopyContext, SerializeContext } from "../types";
import { LINE_TAG, TEXT_DOC } from "../types";
import { getFragmentText, serializeHTML } from "../types/serialize";

export class Copy {
  constructor(private editor: Editor) {}

  /**
   * 复制 Delta 到剪贴板
   * @param delta
   */
  public copy(delta: Delta) {
    const rootNode = this.serialize(delta);
    const context: CopyContext = { delta: delta, html: rootNode };
    this.editor.plugin.call(CALLER_TYPE.WILL_SET_CLIPBOARD, context);
    const plainText = getFragmentText(context.html);
    const htmlText = serializeHTML(context.html);
    const editorText = JSON.stringify(delta.ops);
    const dataTransfer = {
      [TEXT_PLAIN]: plainText,
      [TEXT_HTML]: htmlText,
      [TEXT_DOC]: editorText,
    };
    this.editor.logger.info("Set Clipboard Data:", dataTransfer);
    Clipboard.write(dataTransfer);
  }

  /**
   * 序列化 Delta 为 HTML
   * @param delta
   * @param rootNode
   */
  public serialize(delta: Delta): DocumentFragment;
  public serialize<T extends Node>(delta: Delta, rootNode?: T): T;
  public serialize<T extends Node>(delta: Delta, rootNode?: T): T {
    const root = rootNode || document.createDocumentFragment();
    let lineFragment = document.createDocumentFragment();
    for (const op of delta.ops) {
      if (isEOLOp(op)) {
        const context: SerializeContext = { op: op, html: lineFragment };
        this.editor.plugin.call(CALLER_TYPE.SERIALIZE, context);
        const lineNode = document.createElement("div");
        lineNode.setAttribute(LINE_TAG, "true");
        lineNode.appendChild(context.html);
        root.appendChild(lineNode);
        lineFragment = document.createDocumentFragment();
        continue;
      }
      const text = op.insert || "";
      const textNode = document.createTextNode(text);
      const context: SerializeContext = { op: op, html: textNode };
      this.editor.plugin.call(CALLER_TYPE.SERIALIZE, context);
      lineFragment.appendChild(context.html);
    }
    return root as T;
  }
}
