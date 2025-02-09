import type { CMDPayload, Editor } from "block-kit-core";
import { EDITOR_EVENT, Point, RawPoint } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactLineContext } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import { Bind, KEY_CODE, NIL, preventNativeEvent, TRULY } from "block-kit-utils";
import type { ReactNode } from "react";

import { INDENT_LEVEL_KEY } from "../indent/types";
import { isEmptyLine, isKeyCode } from "../shared/utils/is";
import { LIST_START_KEY, ORDER_LIST_KEY } from "./types";
import { applyNewOrderList } from "./utils/serial";
import { OrderListView } from "./view/list";

export class OrderListPlugin extends EditorPlugin {
  public key = ORDER_LIST_KEY;

  constructor(protected editor: Editor) {
    super();
    editor.command.register(ORDER_LIST_KEY, this.onExec);
    editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public destroy(): void {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[ORDER_LIST_KEY];
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
    const isList = lines.every(line => line.attributes[ORDER_LIST_KEY]);
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
        [ORDER_LIST_KEY]: isList ? NIL : TRULY,
      };
      if (!isList) {
        attrs[INDENT_LEVEL_KEY] = lineState.attributes[INDENT_LEVEL_KEY];
      }
      delta.retain(1, attrs);
    }
    this.editor.state.apply(delta, { autoCaret: false });
    applyNewOrderList(this.editor, sel);
  }

  @Bind
  protected onKeyDown(event: KeyboardEvent) {
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
      attrs[ORDER_LIST_KEY] &&
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
        nextAttrs[ORDER_LIST_KEY] = NIL;
      }
      const delta = new Delta().retain(startLine.start + startLine.length - 1).retain(1, nextAttrs);
      this.editor.state.apply(delta, { autoCaret: false });
      applyNewOrderList(this.editor, sel);
      preventNativeEvent(event);
      return void 0;
    }
    // 当前行是列表行, 且按下回车键, 且选区折叠, 且位于行首, 且上一行是列表行
    // => 避免默认的处理, 保持列表的连续性
    if (
      isKeyCode(event, KEY_CODE.ENTER) &&
      attrs[ORDER_LIST_KEY] &&
      sel.isCollapsed &&
      !sel.start.offset &&
      prevLine &&
      prevLine.attributes[ORDER_LIST_KEY]
    ) {
      const delta = new Delta().retain(startLine.start).insertEOL({ ...prevLine.attributes });
      this.editor.state.apply(delta);
      applyNewOrderList(this.editor, sel);
      preventNativeEvent(event);
      return void 0;
    }
    // 当前行是列表行, 且按下回车键
    // => 在列表行内部插入换行符, 且携带列表状态
    if (isKeyCode(event, KEY_CODE.ENTER) && attrs[ORDER_LIST_KEY]) {
      this.editor.perform.insertBreak(sel, attrs);
      applyNewOrderList(this.editor, sel);
      preventNativeEvent(event);
      return void 0;
    }
    // 当前行是列表行, 且折叠选区, 且在行首, 且按下退格键
    // => 将当前行的列表状态移除, 保留缩进的等级
    if (
      isKeyCode(event, KEY_CODE.BACKSPACE) &&
      sel.isCollapsed &&
      attrs[ORDER_LIST_KEY] &&
      !sel.start.offset
    ) {
      const delta = new Delta()
        .retain(startLine.start + startLine.length - 1)
        .retain(1, { [ORDER_LIST_KEY]: NIL, [LIST_START_KEY]: NIL });
      this.editor.state.apply(delta, { autoCaret: false });
      applyNewOrderList(this.editor, sel);
      preventNativeEvent(event);
      return void 0;
    }
    // 当前行是列表行, 按下 Tab 键
    // => 由列表的缩进状态调整列表的序号
    if (isKeyCode(event, KEY_CODE.TAB) && attrs[ORDER_LIST_KEY]) {
      applyNewOrderList(this.editor, sel);
      preventNativeEvent(event);
      return void 0;
    }
    // 处于当前行的行首, 且不存在其他行属性, 且前一行是列表行
    // => 将当前行属性移到下一行, 且刷新列表值
    if (
      !sel.start.offset &&
      !Object.keys(attrs).length &&
      prevLine &&
      prevLine.attributes[ORDER_LIST_KEY]
    ) {
      const prevAttrs = { ...prevLine.attributes };
      const delta = new Delta()
        .retain(startLine.start - 1)
        .delete(1)
        .retain(startLine.length - 1)
        .retain(1, prevAttrs);
      this.editor.state.apply(delta);
      applyNewOrderList(this.editor, sel);
      preventNativeEvent(event);
      return void 0;
    }
  }
}
