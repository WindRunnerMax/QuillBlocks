import type { Delta } from "block-kit-delta";
import { isRetainOp } from "block-kit-delta";
import { Bind } from "block-kit-utils";

import type { Editor } from "../editor";
import type { ContentChangeEvent } from "../event/bus/types";
import { EDITOR_EVENT } from "../event/bus/types";
import { isRedo, isUndo } from "../input/utils/hot-key";
import { Range } from "../selection/modules/range";
import { RawRange } from "../selection/modules/raw-range";
import { APPLY_SOURCE } from "../state/types";
import type { StackItem } from "./types";

export class History {
  /** 延时 */
  protected readonly DELAY = 1000;
  /** 堆栈最大值 */
  protected readonly STACK_SIZE = 100;
  /** 前次执行记录时间 */
  protected lastRecord: number;
  /** UNDO 栈 */
  protected undoStack: StackItem[];
  /** REDO 栈 */
  protected redoStack: StackItem[];
  /** 当前选区 */
  protected currentRange: RawRange | null;
  /** 批量执行 */
  protected batching: number[];

  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: Editor) {
    this.batching = [];
    this.redoStack = [];
    this.undoStack = [];
    this.lastRecord = 0;
    this.currentRange = null;
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
    this.editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
    this.editor.event.on(EDITOR_EVENT.CONTENT_WILL_CHANGE, this.onContentWillChange);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.undoStack = [];
    this.redoStack = [];
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
    this.editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
    this.editor.event.off(EDITOR_EVENT.CONTENT_WILL_CHANGE, this.onContentWillChange);
  }

  /**
   * undo
   */
  public undo() {
    if (!this.undoStack.length) return void 0;
    const item = this.undoStack.pop();
    if (!item) return void 0;
    const base = this.editor.state.toBlockSet();
    const inverted = item.delta.invert(base);
    this.redoStack.push({
      id: item.id,
      delta: inverted,
      range: this.transformRange(item.range, inverted),
    });
    this.lastRecord = 0;
    this.editor.state.apply(item.delta, { source: APPLY_SOURCE.HISTORY });
    this.restoreSelection(item);
  }

  /**
   * redo
   */
  public redo() {
    if (!this.redoStack.length) return void 0;
    const item = this.redoStack.pop();
    if (!item) return void 0;
    const base = this.editor.state.toBlockSet();
    const inverted = item.delta.invert(base);
    this.undoStack.push({
      id: item.id,
      delta: inverted,
      range: this.transformRange(item.range, inverted),
    });
    this.lastRecord = 0;
    this.editor.state.apply(item.delta, { source: APPLY_SOURCE.HISTORY });
    this.restoreSelection(item);
  }

  /**
   * 开始批量操作
   * - 以堆栈的形式记录状态
   * ```
   * begin
   *  apply
   *    begin
   *      apply
   *    close
   * close
   * ```
   */
  public beginBatch() {
    this.batching.push(1);
  }

  /**
   * 结束批量操作
   * - 务必保证 begin 和 close 成对出现
   */
  public closeBatch() {
    this.batching.pop();
  }

  /**
   * 批量执行回调
   * @param callback
   */
  public batch(callback: () => void) {
    this.beginBatch();
    callback();
    this.closeBatch();
  }

  /**
   * 正在执行批量操作
   */
  public isBatching() {
    return this.batching.length > 0;
  }

  /**
   * 将 mergeId 记录合并到 baseId 记录
   * - 暂时仅支持合并 retain 操作, 需保证 baseId < mergeId
   * - 其他操作暂时没有场景, 可查阅 NOTE 的 History Merge 一节
   * @param baseId
   * @param mergeId
   */
  public mergeRecord(baseId: string, mergeId: string): boolean {
    const baseIndex = this.undoStack.findIndex(item => item.id.has(baseId));
    const mergeIndex = this.undoStack.findIndex(item => item.id.has(mergeId));
    if (baseIndex === -1 || mergeIndex === -1 || baseIndex >= mergeIndex) {
      return false;
    }
    const baseItem = this.undoStack[baseIndex];
    const mergeItem = this.undoStack[mergeIndex];
    let mergeDelta = mergeItem.delta;
    for (let i = mergeIndex - 1; i > baseIndex; i--) {
      const item = this.undoStack[i];
      mergeDelta = item.delta.transform(mergeDelta);
    }
    this.undoStack[baseIndex] = {
      id: new Set([...baseItem.id, ...mergeItem.id]),
      // 这里是 merge.compose(base) 而不是相反
      // 因为 undo 后的执行顺序是 merge -> base
      delta: mergeDelta.compose(baseItem.delta),
      range: baseItem.range,
    };
    this.undoStack.splice(mergeIndex, 1);
    return true;
  }

  /**
   * undoable
   */
  public isUndoAble() {
    return this.undoStack.length > 0;
  }

  /**
   * redoable
   */
  public isRedoAble() {
    return this.redoStack.length > 0;
  }

  /**
   * 获取最新选区
   */
  @Bind
  protected onContentWillChange() {
    const range = this.editor.selection.toRaw();
    this.currentRange = range;
  }

  /**
   * 键盘事件
   * @param event
   */
  @Bind
  protected onKeyDown(event: KeyboardEvent) {
    if (isUndo(event)) {
      this.undo();
      event.preventDefault();
    }
    if (isRedo(event)) {
      this.redo();
      event.preventDefault();
    }
  }

  /**
   * 处理内容变更事件
   * @param event
   */
  @Bind
  protected onContentChange(event: ContentChangeEvent) {
    const { changes, previous, source, id } = event;
    if (!changes.ops.length || source === APPLY_SOURCE.HISTORY) {
      return void 0;
    }
    if (event.source === APPLY_SOURCE.REMOTE) {
      this.transformStack(this.undoStack, changes);
      this.transformStack(this.redoStack, changes);
      return void 0;
    }
    this.redoStack = [];
    let inverted = changes.invert(previous);
    let undoRange = this.currentRange;
    let idSet = new Set<string>([id]);
    const timestamp = Date.now();
    if (
      // 如果触发时间在 delay 时间片内或者批量执行时, 需要合并上一个记录
      (this.lastRecord + this.DELAY > timestamp || this.isBatching()) &&
      this.undoStack.length > 0
    ) {
      const item = this.undoStack.pop();
      if (item) {
        inverted = inverted.compose(item.delta);
        undoRange = item.range;
        idSet = new Set([id, ...item.id]);
      }
    } else {
      this.lastRecord = timestamp;
    }
    if (!inverted.ops.length) {
      return void 0;
    }
    this.undoStack.push({ delta: inverted, range: undoRange, id: idSet });
    if (this.undoStack.length > this.STACK_SIZE) {
      this.undoStack.shift();
    }
  }

  /**
   * 变换远程堆栈
   * @param stack
   * @param delta
   */
  protected transformStack(stack: StackItem[], delta: Delta) {
    let remoteDelta = delta;
    for (let i = stack.length - 1; i >= 0; i--) {
      const prevItem = stack[i];
      stack[i] = {
        id: prevItem.id,
        delta: remoteDelta.transform(prevItem.delta, true),
        range: prevItem.range && this.transformRange(prevItem.range, remoteDelta),
      };
      remoteDelta = prevItem.delta.transform(remoteDelta);
      if (!stack[i].delta.ops.length) {
        stack.splice(i, 1);
      }
    }
  }

  /**
   * 变换选区
   * @param range
   * @param delta
   */
  protected transformRange(range: RawRange | null, delta: Delta) {
    if (!range) return range;
    const start = delta.transformPosition(range.start);
    const end = delta.transformPosition(range.start + range.len);
    return new RawRange(start, end - start);
  }

  /**
   * 恢复选区位置
   * @param stackItem
   */
  protected restoreSelection(stackItem: StackItem) {
    if (stackItem.range) {
      const range = Range.fromRaw(this.editor, stackItem.range);
      this.editor.selection.set(range);
    } else {
      let index = 0;
      if (isRetainOp(stackItem.delta.ops[0])) {
        index = stackItem.delta.ops[0].retain;
      }
      const rawRange = RawRange.fromEdge(index, index);
      const range = Range.fromRaw(this.editor, rawRange);
      this.editor.selection.set(range);
    }
  }
}
