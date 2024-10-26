import type { Op } from "block-kit-delta";
import { Delta } from "block-kit-delta";

import type { Editor } from "../editor";
import type { Range } from "../selection/modules/range";
import { Copy } from "./modules/copy";
import { Paste } from "./modules/paste";

export class Clipboard {
  private copyModule: Copy;
  private pasteModule: Paste;

  /**
   * 构造函数
   * @param editor
   */
  constructor(private editor: Editor) {
    this.copyModule = new Copy(editor);
    this.pasteModule = new Paste(editor);
  }

  /**
   * 销毁模块
   */
  public destroy() {}

  /**
   * 通过 Range 获取 Delta 片段
   * @param range
   */
  public getFragment(range?: Range) {
    const at = range || this.editor.selection.get();
    if (!at) return null;
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
