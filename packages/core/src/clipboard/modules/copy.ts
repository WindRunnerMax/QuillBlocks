import type { Delta } from "block-kit-delta";
import type { Op } from "block-kit-delta";
import { EOL, isEOLOp, normalizeEOL } from "block-kit-delta";
import { Clipboard, TEXT_HTML, TEXT_PLAIN } from "block-kit-utils";

import type { Editor } from "../../editor";
import { CALLER_TYPE } from "../../plugin/types";
import type { CopyContext, SerializeContext } from "../types";
import { LINE_TAG, TEXT_DOC } from "../types";
import { getFragmentText, serializeHTML } from "../utils/serialize";

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
    Clipboard.execCopyCommand(dataTransfer);
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
    const ops = normalizeEOL(delta.ops);
    for (const op of ops) {
      if (isEOLOp(op)) {
        const context: SerializeContext = { op, html: lineFragment };
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
      const context: SerializeContext = { op, html: textNode };
      this.editor.plugin.call(CALLER_TYPE.SERIALIZE, context);
      lineFragment.appendChild(context.html);
    }
    if (lineFragment.childNodes.length) {
      const op: Op = { insert: EOL };
      const context: SerializeContext = { op, html: lineFragment };
      this.editor.plugin.call(CALLER_TYPE.SERIALIZE, context);
      const lineNode = document.createElement("div");
      lineNode.setAttribute(LINE_TAG, "true");
      lineNode.appendChild(context.html);
      root.appendChild(lineNode);
    }
    return root as T;
  }
}
