import type { CMDPayload, Editor } from "block-kit-core";
import { EDITOR_EVENT, Point, RawPoint } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { EventContext } from "block-kit-utils";
import { Bind, KEY_CODE, NIL } from "block-kit-utils";
import type { ReactNode } from "react";

import { LIST_TYPE_KEY } from "../bullet-list/types";
import { INDENT_LEVEL_KEY } from "../indent/types";
import { preventContextEvent } from "../shared/utils/dom";
import { isEmptyLine, isKeyCode } from "../shared/utils/is";
import { LIST_RESTART_KEY, LIST_START_KEY, ORDER_LIST_KEY, ORDER_LIST_TYPE } from "./types";
import { isOrderList } from "./utils/is";
import { applyNewOrderList } from "./utils/serial";
import { OrderListView } from "./view/list";

export class OrderListPlugin extends EditorPlugin {
  public key = ORDER_LIST_KEY;

  constructor(protected editor: Editor) {
    super();
    editor.command.register(this.key, this.onExec);
    editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public match(attrs: AttributeMap): boolean {
    return isOrderList(attrs);
  }

  public renderLine(context: ReactLineContext): ReactNode {
    const level = Number(context.attributes[INDENT_LEVEL_KEY]) || 0;
    const start = Number(context.attributes[LIST_START_KEY]) || 1;
    return (
      <OrderListView level={level} start={start} editor={this.editor} context={context}>
        {context.children}
      </OrderListView>
    );
  }

  @Bind
  protected onExec(payload: CMDPayload) {
    const editor = this.editor;
    const sel = editor.selection.get() || payload.range;
    if (!sel) return void 0;
    const { start, end } = sel;
    // 先检查当前需要设置/解除列表状态
    const lines = editor.state.block.getLines().slice(start.line, end.line + 1);
    const isList = lines.every(line => isOrderList(line.attributes));
    // 计算需要操作的范围
    const rawPoint = RawPoint.fromPoint(this.editor, Point.from(start.line, 0));
    if (!rawPoint) return void 0;
    const block = this.editor.state.block;
    const delta = new Delta();
    delta.retain(rawPoint.offset);
    // 根据行的状态, 逐行设置列表状态
    for (let i = start.line; i <= end.line; i++) {
      const lineState = block.getLine(i);
      if (!lineState) break;
      delta.retain(lineState.length - 1);
      const attrs: AttributeMap = {
        [LIST_TYPE_KEY]: isList ? NIL : ORDER_LIST_TYPE,
        [LIST_START_KEY]: isList ? NIL : "1",
      };
      if (!isList && lineState.attributes[INDENT_LEVEL_KEY]) {
        attrs[INDENT_LEVEL_KEY] = lineState.attributes[INDENT_LEVEL_KEY];
      }
      if (!isList && lineState.attributes[LIST_RESTART_KEY]) {
        attrs[LIST_RESTART_KEY] = lineState.attributes[LIST_RESTART_KEY];
      }
      delta.retain(1, attrs);
    }
    this.editor.state.apply(delta, { autoCaret: false });
    applyNewOrderList(this.editor, sel);
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
    // 当前行是列表行, 且按下回车键, 且选区折叠, 且当前行是空内容行
    // => 处理列表的缩进等级
    if (
      isKeyCode(event, KEY_CODE.ENTER) &&
      isOrderList(attrs) &&
      sel.isCollapsed &&
      isEmptyLine(startLine)
    ) {
      const level = Number(attrs[INDENT_LEVEL_KEY]);
      const nextAttrs: AttributeMap = {};
      if (level > 0) {
        // 缩进等级大于 0, 则减少缩进等级
        const nextLevel = level - 1 > 0 ? String(level - 1) : NIL;
        nextAttrs[INDENT_LEVEL_KEY] = nextLevel;
      } else {
        // 否则, 取消列表状态
        nextAttrs[LIST_TYPE_KEY] = NIL;
        nextAttrs[LIST_START_KEY] = NIL;
        nextAttrs[LIST_RESTART_KEY] = NIL;
      }
      const delta = new Delta().retain(startLine.start + startLine.length - 1).retain(1, nextAttrs);
      this.editor.state.apply(delta, { autoCaret: false });
      applyNewOrderList(this.editor, sel);
      preventContextEvent(event, context);
      return void 0;
    }
    // 当前行是列表行, 且按下回车键, 且选区折叠, 且位于行首, 且上一行是列表行
    // => 继续编号, 避免默认的处理, 保持列表的连续性
    if (
      isKeyCode(event, KEY_CODE.ENTER) &&
      isOrderList(attrs) &&
      sel.isCollapsed &&
      !sel.start.offset &&
      prevLine &&
      isOrderList(prevLine.attributes)
    ) {
      const nextAttrs = { ...prevLine.attributes };
      if (attrs[INDENT_LEVEL_KEY]) {
        // 缩进层级优先取当前行的缩进层级
        nextAttrs[INDENT_LEVEL_KEY] = attrs[INDENT_LEVEL_KEY];
      }
      const delta = new Delta().retain(startLine.start).insertEOL(nextAttrs);
      this.editor.state.apply(delta);
      applyNewOrderList(this.editor, sel);
      preventContextEvent(event, context);
      return void 0;
    }
    // 当前行是列表行, 且按下回车键
    // => 在列表行内部插入换行符, 且携带列表状态
    if (isKeyCode(event, KEY_CODE.ENTER) && isOrderList(attrs)) {
      this.editor.perform.insertBreak(sel, attrs);
      applyNewOrderList(this.editor, sel);
      preventContextEvent(event, context);
      return void 0;
    }
    // 当前行是列表行, 且折叠选区, 且在行首, 且按下退格键
    // => 将当前行的列表状态移除, 保留缩进的等级
    if (
      isKeyCode(event, KEY_CODE.BACKSPACE) &&
      sel.isCollapsed &&
      isOrderList(attrs) &&
      !sel.start.offset
    ) {
      const delta = new Delta().retain(startLine.start + startLine.length - 1).retain(1, {
        [LIST_TYPE_KEY]: NIL,
        [LIST_START_KEY]: NIL,
        [LIST_RESTART_KEY]: NIL,
      });
      this.editor.state.apply(delta, { autoCaret: false });
      applyNewOrderList(this.editor, sel);
      preventContextEvent(event, context);
      return void 0;
    }
    // 当前行是列表行, 按下 Tab 键
    // => 由列表的缩进状态调整列表的序号
    if (isKeyCode(event, KEY_CODE.TAB) && isOrderList(attrs)) {
      applyNewOrderList(this.editor, sel);
      preventContextEvent(event, context);
      return void 0;
    }
    // 处于当前行的行首, 且不存在其他行属性, 且前一行是列表行
    // => 将当前上一行属性移到当前行, 且刷新列表值
    if (
      isKeyCode(event, KEY_CODE.BACKSPACE) &&
      !sel.start.offset &&
      !Object.keys(attrs).length &&
      prevLine &&
      isOrderList(prevLine.attributes)
    ) {
      const prevAttrs = { ...prevLine.attributes };
      const delta = new Delta()
        .retain(startLine.start - 1)
        .delete(1)
        .retain(startLine.length - 1)
        .retain(1, prevAttrs);
      this.editor.state.apply(delta);
      applyNewOrderList(this.editor, sel);
      preventContextEvent(event, context);
      return void 0;
    }
  }
}
