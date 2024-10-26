import type { Op } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import { TEXT_HTML, TEXT_PLAIN, TSON } from "block-kit-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/types";
import { pickOpAtRange } from "../input/utils/collection";
import type { Range } from "../selection/modules/range";
import { Copy } from "./modules/copy";
import { Paste } from "./modules/paste";
import { TEXT_DOC } from "./types";

export class Clipboard {
  /** Copy Module */
  public copyModule: Copy;
  /** Paste Module */
  public pasteModule: Paste;

  /**
   * 构造函数
   * @param editor
   */
  constructor(private editor: Editor) {
    this.copyModule = new Copy(editor);
    this.pasteModule = new Paste(editor);
    this.editor.event.on(EDITOR_EVENT.CUT, this.onCut);
    this.editor.event.on(EDITOR_EVENT.COPY, this.onCopy);
    this.editor.event.on(EDITOR_EVENT.PASTE, this.onPaste);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.editor.event.off(EDITOR_EVENT.CUT, this.onCut);
    this.editor.event.off(EDITOR_EVENT.COPY, this.onCopy);
    this.editor.event.off(EDITOR_EVENT.PASTE, this.onPaste);
  }

  /**
   * OnCopy 事件
   * @param event
   */
  private onCopy = (event: ClipboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const sel = this.editor.selection.get();
    if (!sel) return void 0;
    const delta = new Delta();
    if (sel.isCollapsed) {
      // 在选区折叠的情况下需要特判 Void 节点类型
      const op = pickOpAtRange(this.editor, sel);
      if (op && this.editor.schema.isVoid(op)) {
        delta.push(op);
      }
    } else {
      const fragment = this.getFragment();
      fragment && delta.ops.push(...fragment.ops);
    }
    if (!delta.ops.length) return void 0;
    this.copyModule.copy(delta);
    this.editor.selection.focus();
  };

  /**
   * OnCut 事件
   * @param event
   */
  private onCut = (event: ClipboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const sel = this.editor.selection.get();
    if (!sel) return void 0;
    !sel.isCollapsed && this.editor.perform.deleteFragment(sel);
    this.onCopy(event);
  };

  /**
   * OnPaste 事件
   * @param event
   */
  private onPaste = (event: ClipboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const transfer = event.clipboardData;
    if (!transfer || this.editor.state.isReadonly()) {
      return void 0;
    }
    const files = Array.from(transfer.files);
    const transferDocText = transfer.getData(TEXT_DOC);
    const transferHTMLText = transfer.getData(TEXT_HTML);
    const transferPlainText = transfer.getData(TEXT_PLAIN);
    this.editor.logger.info("Paste Clipboard Data:", {
      files: files,
      [TEXT_DOC]: transferDocText,
      [TEXT_HTML]: transferHTMLText,
      [TEXT_PLAIN]: transferPlainText,
    });
    if (transferDocText) {
      const ops = TSON.parse<Op[]>(transferDocText);
      const delta = ops && new Delta(ops);
      return delta && this.pasteModule.applyDelta(delta);
    }
    if (files.length) {
      return this.pasteModule.applyFiles(files);
    }
    if (transferHTMLText) {
      const parser = new DOMParser();
      const html = parser.parseFromString(transferHTMLText, TEXT_HTML);
      if (!html.body || !html.body.hasChildNodes()) return void 0;
      const delta = this.pasteModule.deserialize(html.body);
      return this.pasteModule.applyDelta(delta);
    }
    if (transferPlainText) {
      return this.pasteModule.applyPlainText(transfer);
    }
  };

  /**
   * 通过 Range 获取 Delta 片段
   * @param range
   */
  public getFragment(range?: Range) {
    const at = range || this.editor.selection.get();
    if (!at || at.isCollapsed) return null;
    const { start, end } = at;
    const block = this.editor.state.block;
    // 如果是同行则直接 slice
    if (start.line === end.line) {
      const lineState = block.getLine(start.line);
      const nextOps = lineState ? lineState.slice(start.offset, end.offset) : [];
      return new Delta(nextOps);
    }
    const ops: Op[] = [];
    // 处理首行
    const firstLine = block.getLine(start.line);
    const firstOps = firstLine ? firstLine.slice(start.offset, firstLine.length) : [];
    ops.push(...firstOps);
    // 处理中间行
    for (let i = start.line + 1, len = end.line - 1; i <= len; i++) {
      const lineState = block.getLine(i);
      if (!lineState) continue;
      ops.push(...lineState.getOps());
    }
    // 处理尾行
    const lastLine = block.getLine(end.line);
    const lastOps = lastLine ? lastLine.slice(0, end.offset) : [];
    ops.push(...lastOps);
    return new Delta(ops);
  }
}
