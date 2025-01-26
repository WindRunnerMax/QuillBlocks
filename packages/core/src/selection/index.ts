import { Bind } from "block-kit-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/types";
import { isArrowLeft, isArrowRight } from "../input/utils/hot-key";
import { EDITOR_STATE } from "../state/types";
import { Point } from "./modules/point";
import { Range } from "./modules/range";
import { RawRange } from "./modules/raw-range";
import { getRootSelection, getStaticSelection, isEmbedZeroNode, isVoidZeroNode } from "./utils/dom";
import { isBackwardDOMRange } from "./utils/dom";
import { toModelRange } from "./utils/model";
import { isEqualDOMRange, toDOMRange } from "./utils/native";

export class Selection {
  /** 上次时间片快照 */
  protected lastRecord: number = 0;
  /** 时间片内执行次数 */
  protected execution: number = 0;
  /** 先前选区 */
  protected previous: Range | null = null;
  /** 当前选区 */
  protected current: Range | null = null;

  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: Editor) {
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onArrowKeyDown);
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE_NATIVE, this.onNativeSelectionChange);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onArrowKeyDown);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE_NATIVE, this.onNativeSelectionChange);
  }

  /**
   * 获取当前选区
   */
  public get(): Range | null {
    return this.current;
  }

  /**
   * 获取 RawRangeModel 选区表达
   */
  public toRaw() {
    return RawRange.fromRange(this.editor, this.current);
  }

  /**
   * 检查时间片执行次数限制
   */
  protected limit() {
    const now = Date.now();
    // 如果距离上次记录时间超过 500ms, 重置执行次数
    if (now - this.lastRecord >= 500) {
      this.execution = 0;
      this.lastRecord = now;
    }
    // 如果执行次数超过 100 次的限制, 需要打断执行
    if (this.execution++ >= 100) {
      this.editor.logger.error("Selection Exec Limit", this.execution);
      return true;
    }
    return false;
  }

  /**
   * 处理选区变换事件
   */
  @Bind
  protected onNativeSelectionChange() {
    if (this.editor.state.isComposing()) {
      return void 0;
    }
    const root = this.editor.getContainer();
    const sel = getRootSelection(root);
    const staticSel = getStaticSelection(sel);
    if (!sel || !staticSel || this.limit()) {
      return void 0;
    }
    // 选区必然是从 startContainer 到 endContainer
    const { startContainer, endContainer, collapsed } = staticSel;
    if (!root.contains(startContainer)) {
      return void 0;
    }
    if (!collapsed && !root.contains(endContainer)) {
      return void 0;
    }
    const backward = isBackwardDOMRange(sel, staticSel);
    const range = toModelRange(this.editor, staticSel, backward);
    this.set(range, true);
  }

  /**
   * 更新选区模型
   * @param range
   * @param force [?false]
   */
  public set(range: Range | null, force = false): void {
    if (Range.isEqual(this.current, range)) {
      this.current = range;
      // FIX: [cursor]\n 状态按右键 Model 校准, 但是 DOM 没有校准
      // 因此即使选区没有变化, 在 force 模式下也需要更新 DOM 选区
      force && this.updateDOMSelection();
      return void 0;
    }
    this.previous = this.current;
    this.current = range;
    this.editor.logger.debug("Selection Change", range);
    this.editor.event.trigger(EDITOR_EVENT.SELECTION_CHANGE, {
      previous: this.previous,
      current: this.current,
    });
    if (force) {
      this.updateDOMSelection();
    }
  }

  /**
   * 更新浏览器选区
   */
  public updateDOMSelection() {
    const range = this.current;
    if (!range || this.editor.state.get(EDITOR_STATE.COMPOSING)) {
      return false;
    }
    const root = this.editor.getContainer();
    const selection = getRootSelection(root);
    if (!selection) {
      return false;
    }
    const sel = toDOMRange(this.editor, range);
    if (!sel || !sel.startContainer || !sel.endContainer) {
      this.editor.logger.warning("Invalid DOM Range", sel, range);
      selection.removeAllRanges();
      return false;
    }
    const currentStaticSel = getStaticSelection(selection);
    if (isEqualDOMRange(sel, currentStaticSel)) {
      return true;
    }
    const { startContainer, startOffset, endContainer, endOffset } = sel;
    // FIX: 这里的 Backward 以 Range 状态为准
    if (range.isBackward) {
      selection.setBaseAndExtent(endContainer, endOffset, startContainer, startOffset);
    } else {
      selection.setBaseAndExtent(startContainer, startOffset, endContainer, endOffset);
    }
    return true;
  }

  /**
   * 聚焦选区
   */
  public focus() {
    if (this.editor.state.isFocused()) {
      return void 0;
    }
    this.editor.getContainer().focus();
    this.current && this.updateDOMSelection();
  }

  /**
   * 处理方向键选区事件
   * @param event
   */
  @Bind
  protected onArrowKeyDown(event: KeyboardEvent) {
    const leftArrow = isArrowLeft(event);
    const rightArrow = isArrowRight(event);
    if (!(leftArrow || rightArrow) || event.metaKey || event.altKey) {
      return void 0;
    }
    const range = this.get();
    if (!range || !this.editor.state.isFocused() || this.editor.state.isComposing()) {
      return void 0;
    }
    const focus = range.isBackward ? range.start : range.end;
    const anchor = range.isBackward ? range.end : range.start;
    const blockState = this.editor.state.block;
    const lineState = blockState && blockState.getLine(focus.line);
    if (!blockState || !lineState) return void 0;
    const sel = getSelection();
    // 判断当前节点是否为 Block Void, 此时光标必定位于 offset 1 处
    const isBlockVoid = sel && isVoidZeroNode(sel.focusNode);
    const isFocusLineStart = focus.offset === 0 || isBlockVoid;
    // 由于选区会强制变换到末尾节点前 因此需要取 length - 1
    const isFocusLineEnd = focus.offset === lineState.length - 1;
    let newFocus: Point | null = null;
    // 左键且在非首行的首节点时 将选取设置为前一行的末尾
    if (leftArrow && isFocusLineStart) {
      const prevLine = lineState.prev();
      if (!prevLine) return void 0;
      newFocus = new Point(prevLine.index, prevLine.length - 1);
    }
    // 右键且在非末行的末节点时 将选取设置为后一行的首节点
    if (rightArrow && isFocusLineEnd) {
      const nextLine = lineState.next();
      if (!nextLine) return void 0;
      newFocus = new Point(nextLine.index, 0);
    }
    // 右键且在嵌入节点时 将光标放在嵌入节点后
    if (rightArrow && sel && isEmbedZeroNode(sel.focusNode)) {
      const line = newFocus ? newFocus.line : focus.line;
      const offset = newFocus ? newFocus.offset : focus.offset;
      newFocus = new Point(line, offset + 1);
    }
    // 如果存在新的焦点, 则统一更新选区
    if (newFocus) {
      event.preventDefault();
      // 1. 选区折叠时 shift + left 一定是反选, 否则取原始选区方向
      // 2. 选区折叠时 shift + right 一定是正选, 否则取原始选区方向
      // 若 [focus]\n[anchor] 此时按 right, 会被认为是 反选+折叠, 实际状态会被 new Range 校正
      const isBackward = event.shiftKey && range.isCollapsed ? !!leftArrow : range.isBackward;
      const newAnchor = event.shiftKey ? anchor : newFocus.clone();
      // COMPAT: 选区正向 则只会影响到 end 节点, 选区反向 则只会影响到 start 节点
      // 而 Range => start -> end, 只需要判断 isBackward 标识
      // start -> end 实际方向会在 new Range 时处理, 无需在此处实现
      const newRange = new Range(newAnchor, newFocus, isBackward);
      this.set(newRange, true);
    }
  }
}
