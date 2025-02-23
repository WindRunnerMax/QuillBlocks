import "./styles/index.scss";

import type { CMDPayload, Editor } from "block-kit-core";
import { EDITOR_EVENT, Point, RawPoint } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactWrapLineContext } from "block-kit-react";
import { EditorPlugin, InjectWrapKeys } from "block-kit-react";
import type { EventContext } from "block-kit-utils";
import { Bind, KEY_CODE, NIL, TRULY } from "block-kit-utils";
import type { ReactNode } from "react";

import { preventContextEvent } from "../shared/utils/dom";
import { isEmptyLine, isKeyCode } from "../shared/utils/is";
import { QUOTE_KEY } from "./types";

export class QuotePlugin extends EditorPlugin {
  public key = QUOTE_KEY;

  constructor(protected editor: Editor) {
    super();
    editor.command.register(this.key, this.onExec);
    editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[QUOTE_KEY];
  }

  @InjectWrapKeys(QUOTE_KEY)
  public wrapLine(context: ReactWrapLineContext): ReactNode {
    if (!context.lineState.attributes[QUOTE_KEY]) {
      return context.children;
    }
    return <div className="block-kit-quote">{context.children}</div>;
  }

  @Bind
  protected onExec(payload: CMDPayload) {
    const editor = this.editor;
    const sel = editor.selection.get() || payload.range;
    if (!sel) return void 0;
    const { start, end } = sel;
    // 先检查当前需要设置/解除引用状态
    const lines = editor.state.block.getLines().slice(start.line, end.line + 1);
    const isQuote = lines.every(line => line.attributes[QUOTE_KEY]);
    // 计算需要操作的范围
    const rawPoint = RawPoint.fromPoint(this.editor, Point.from(start.line, 0));
    if (!rawPoint) return void 0;
    const block = this.editor.state.block;
    const delta = new Delta();
    delta.retain(rawPoint.offset);
    // 根据行的状态, 逐行设置引用状态
    for (let i = start.line; i <= end.line; i++) {
      const lineState = block.getLine(i);
      if (!lineState) break;
      delta.retain(lineState.length - 1);
      const attrs: AttributeMap = {
        [QUOTE_KEY]: isQuote ? NIL : TRULY,
      };
      delta.retain(1, attrs);
    }
    this.editor.state.apply(delta, { autoCaret: false });
  }

  @Bind
  protected onKeyDown(event: KeyboardEvent, context: EventContext) {
    const sel = this.editor.selection.get();
    if (!sel) return void 0;
    const block = this.editor.state.block;
    const startLine = block.getLine(sel.start.line);
    if (!startLine) return void 0;
    const prevLine = startLine.prev();
    const attrs = startLine.attributes;
    // 当前行是引用行, 且按下回车键, 且选区折叠, 且当前行是空行
    // => 删除当前的引用行格式
    if (
      isKeyCode(event, KEY_CODE.ENTER) &&
      attrs[QUOTE_KEY] &&
      sel.isCollapsed &&
      isEmptyLine(startLine)
    ) {
      const nextAttrs: AttributeMap = {
        [QUOTE_KEY]: NIL,
      };
      const delta = new Delta().retain(startLine.start + startLine.length - 1).retain(1, nextAttrs);
      this.editor.state.apply(delta, { autoCaret: false });
      preventContextEvent(event, context);
      return void 0;
    }
    // 当前行是引用行, 且按下回车键, 且选区折叠, 且位于行首, 且上一行是引用行
    // => 继续引用格式, 避免默认的处理, 保持引用的连续性
    if (
      isKeyCode(event, KEY_CODE.ENTER) &&
      attrs[QUOTE_KEY] &&
      sel.isCollapsed &&
      sel.start.offset === 0 &&
      prevLine &&
      prevLine.attributes[QUOTE_KEY]
    ) {
      const nextAttrs = { ...prevLine.attributes };
      const delta = new Delta().retain(startLine.start).insertEOL(nextAttrs);
      this.editor.state.apply(delta);
      preventContextEvent(event, context);
      return void 0;
    }
    // 当前行是引用行, 且按下回车键, 且非行首
    // => 在引用行内部插入换行符, 且携带引用状态
    if (isKeyCode(event, KEY_CODE.ENTER) && attrs[QUOTE_KEY] && sel.start.offset) {
      this.editor.perform.insertBreak(sel, attrs);
      preventContextEvent(event, context);
      return void 0;
    }
    // 当前行是引用行, 且折叠选区, 且在行首, 且按下退格键
    // => 将当前行的引用状态移除
    if (
      isKeyCode(event, KEY_CODE.BACKSPACE) &&
      sel.isCollapsed &&
      attrs[QUOTE_KEY] &&
      !sel.start.offset
    ) {
      const delta = new Delta()
        .retain(startLine.start + startLine.length - 1)
        .retain(1, { [QUOTE_KEY]: NIL });
      this.editor.state.apply(delta, { autoCaret: false });
      preventContextEvent(event, context);
      return void 0;
    }
  }
}
